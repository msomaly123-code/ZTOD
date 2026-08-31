# core/services/clickpesa_service.py

import requests
import json
import uuid
from django.conf import settings
from django.utils import timezone
from datetime import datetime
from core.models import Payment, Order, ClickPesaTransaction, Customer, Notification


class ClickPesaService:
    def __init__(self):
        self.client_id = settings.CLICKPESA_CONFIG['CLIENT_ID']
        self.api_key = settings.CLICKPESA_CONFIG['API_KEY']
        self.base_url = settings.CLICKPESA_CONFIG['BASE_URL']
        self.callback_url = settings.CLICKPESA_CONFIG['CALLBACK_URL']
        self.redirect_url = settings.CLICKPESA_CONFIG['REDIRECT_URL']
        
        # Supported payment methods
        self.supported_methods = ['tigo_pesa', 'airtel_money']
    
    def get_headers(self):
        """Get headers for API requests"""
        return {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_key}',
            'client-id': self.client_id
        }
    
    def create_payment(self, order, payment_method, mobile_number=None):
        """
        Create a payment request via ClickPesa API
        
        Args:
            order: Order object
            payment_method: 'tigo_pesa' or 'airtel_money'
            mobile_number: Phone number for mobile money payments
        
        Returns:
            dict: Payment response
        """
        # Validate payment method
        if payment_method not in self.supported_methods:
            return {
                'success': False,
                'error': f'Unsupported payment method. Supported: {", ".join(self.supported_methods)}'
            }
        
        # Validate mobile number
        if not mobile_number:
            return {
                'success': False,
                'error': 'Mobile number is required for mobile money payments'
            }
        
        # Clean mobile number
        mobile_number = self.clean_phone_number(mobile_number)
        if not mobile_number:
            return {
                'success': False,
                'error': 'Invalid mobile number format'
            }
        
        transaction_id = f"PAY-{uuid.uuid4().hex[:8].upper()}"
        order_reference = f"ZITOD-ORDER-{order.orderid}"
        
        # Prepare payment data
        payment_data = {
            'transaction_id': transaction_id,
            'order_reference': order_reference,
            'order_id': order.orderid,
            'amount': str(order.totalAmount),
            'currency': 'TZS',
            'payment_method': payment_method,
            'customer_email': order.customerid.email,
            'customer_name': order.customerid.name,
            'mobile_number': mobile_number,
            'callback_url': self.callback_url,
            'redirect_url': self.redirect_url,
            'metadata': {
                'order_id': order.orderid,
                'customer_id': order.customerid.customerid,
                'service': order.serviceid.servicename if order.serviceid else 'N/A',
                'item': order.item.itemname if order.item else 'N/A'
            }
        }
        
        # Create payment record
        payment = Payment.objects.create(
            orderid=order,
            customerid=order.customerid,
            amount=order.totalAmount,
            paymentmethod=payment_method,
            status='pending',
            mobile_number=mobile_number,
            transaction_id=transaction_id
        )
        
        # Create ClickPesa transaction record
        clickpesa_trans = ClickPesaTransaction.objects.create(
            transaction_id=transaction_id,
            payment=payment,
            order=order,
            amount=order.totalAmount,
            payment_method=payment_method,
            status='pending',
            mobile_number=mobile_number,
            request_data=payment_data
        )
        
        try:
            # Call ClickPesa API
            response = requests.post(
                f"{self.base_url}/payments",
                headers=self.get_headers(),
                json=payment_data,
                timeout=30
            )
            
            response_data = response.json()
            clickpesa_trans.response_data = response_data
            clickpesa_trans.save()
            
            payment.clickpesa_response = response_data
            payment.save()
            
            if response.status_code in [200, 201]:
                payment.status = 'processing'
                payment.save()
                
                clickpesa_trans.status = 'processing'
                clickpesa_trans.save()
                
                return {
                    'success': True,
                    'payment': payment,
                    'clickpesa_transaction': clickpesa_trans,
                    'response': response_data,
                    'payment_url': response_data.get('payment_url', ''),
                    'redirect_url': response_data.get('redirect_url', ''),
                    'transaction_id': transaction_id
                }
            else:
                payment.status = 'failed'
                payment.save()
                
                clickpesa_trans.status = 'failed'
                clickpesa_trans.save()
                
                return {
                    'success': False,
                    'error': response_data.get('message', 'Payment creation failed'),
                    'response': response_data
                }
                
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'error': 'Payment gateway timeout. Please try again.'
            }
        except requests.exceptions.RequestException as e:
            payment.status = 'failed'
            payment.save()
            
            clickpesa_trans.status = 'failed'
            clickpesa_trans.save()
            
            return {
                'success': False,
                'error': f'Connection error: {str(e)}'
            }
    
    def verify_payment(self, transaction_id):
        """
        Verify payment status with ClickPesa
        
        Args:
            transaction_id: Payment transaction ID
        
        Returns:
            dict: Payment verification result
        """
        try:
            clickpesa_trans = ClickPesaTransaction.objects.get(transaction_id=transaction_id)
            payment = clickpesa_trans.payment
            
            response = requests.get(
                f"{self.base_url}/payments/{transaction_id}",
                headers=self.get_headers(),
                timeout=30
            )
            
            response_data = response.json()
            clickpesa_trans.callback_data = response_data
            clickpesa_trans.save()
            
            if response.status_code == 200:
                status = response_data.get('status', '').lower()
                
                if status == 'completed':
                    # Update payment status
                    payment.status = 'completed'
                    payment.save()
                    
                    # Update ClickPesa transaction
                    clickpesa_trans.status = 'completed'
                    clickpesa_trans.save()
                    
                    # Update order status
                    order = clickpesa_trans.order
                    order.status = 'paid'
                    order.save()
                    
                    return {
                        'success': True,
                        'status': 'completed',
                        'payment': payment,
                        'clickpesa_transaction': clickpesa_trans,
                        'response': response_data
                    }
                elif status == 'failed':
                    payment.status = 'failed'
                    payment.save()
                    
                    clickpesa_trans.status = 'failed'
                    clickpesa_trans.save()
                    
                    return {
                        'success': False,
                        'status': 'failed',
                        'payment': payment,
                        'clickpesa_transaction': clickpesa_trans,
                        'response': response_data
                    }
                else:
                    return {
                        'success': False,
                        'status': status,
                        'payment': payment,
                        'clickpesa_transaction': clickpesa_trans,
                        'response': response_data
                    }
            else:
                return {
                    'success': False,
                    'error': response_data.get('message', 'Verification failed'),
                    'response': response_data
                }
                
        except ClickPesaTransaction.DoesNotExist:
            return {
                'success': False,
                'error': 'Transaction not found'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def handle_webhook(self, data):
        """
        Handle ClickPesa webhook callback
        
        Supports multiple ClickPesa webhook formats:
        - Direct format: { "transaction_id": "...", "status": "completed" }
        - Event format: { "event": "PAYMENT RECEIVED", "data": { "paymentId": "...", "status": "SUCCESS" } }
        """
        try:
            print("========== CLICKPESA WEBHOOK ==========")
            print("WEBHOOK DATA:", json.dumps(data, indent=2))
            print("========================================")
            
            # Get event type
            event = data.get('event', '')
            webhook_data = data.get('data', {})
            
            if not isinstance(webhook_data, dict):
                webhook_data = {}
            
            # Extract transaction/payment information
            transaction_id = (
                webhook_data.get('paymentId') or
                webhook_data.get('transactionId') or
                webhook_data.get('transaction_id') or
                data.get('paymentId') or
                data.get('transactionId') or
                data.get('transaction_id')
            )
            
            reference = (
                webhook_data.get('orderReference') or
                webhook_data.get('reference') or
                webhook_data.get('order_reference') or
                data.get('orderReference') or
                data.get('reference')
            )
            
            webhook_status = (
                webhook_data.get('status') or
                data.get('status') or
                ''
            ).upper()
            
            amount = (
                webhook_data.get('collectedAmount') or
                webhook_data.get('amount') or
                data.get('amount')
            )
            
            print(f"📌 Extracted - Transaction: {transaction_id}, Status: {webhook_status}, Reference: {reference}")
            
            # Validate transaction/reference
            if not transaction_id and not reference:
                return {
                    'success': False,
                    'error': 'Missing paymentId/transaction_id and orderReference/reference'
                }
            
            # Find transaction
            clickpesa_trans = None
            
            if transaction_id:
                clickpesa_trans = ClickPesaTransaction.objects.filter(
                    transaction_id=transaction_id
                ).first()
            
            # If transaction ID does not match our generated ID, try reference/order reference
            if not clickpesa_trans and reference:
                clickpesa_trans = ClickPesaTransaction.objects.filter(
                    transaction_id=reference
                ).first()
            
            # If still not found, try Payment
            if not clickpesa_trans and transaction_id:
                payment = Payment.objects.filter(
                    transaction_id=transaction_id
                ).first()
                if payment:
                    clickpesa_trans = ClickPesaTransaction.objects.filter(
                        payment=payment
                    ).first()
            
            # Transaction not found
            if not clickpesa_trans:
                print(
                    f"ClickPesa transaction not found. "
                    f"paymentId={transaction_id}, reference={reference}"
                )
                return {
                    'success': False,
                    'error': (
                        f'Transaction not found: '
                        f'paymentId={transaction_id}, '
                        f'reference={reference}'
                    )
                }
            
            # Save webhook data
            clickpesa_trans.callback_data = data
            if reference:
                clickpesa_trans.reference = reference
            clickpesa_trans.save()
            
            payment = clickpesa_trans.payment
            payment.clickpesa_response = data
            payment.save()
            
            order = clickpesa_trans.order
            
            # SUCCESS
            if webhook_status in ['SUCCESS', 'COMPLETED', 'SUCCESSFUL']:
                payment.status = 'completed'
                payment.save()
                
                clickpesa_trans.status = 'completed'
                clickpesa_trans.save()
                
                order.status = 'paid'
                order.save()
                
                # Create notification
                Notification.objects.create(
                    customerid=order.customerid,
                    orderid=order,
                    Message=(
                        f'✅ Payment of TSh {payment.amount} confirmed '
                        f'for Order #{order.orderid} via '
                        f'{payment.get_paymentmethod_display()}'
                    )
                )
                
                print(
                    f"PAYMENT SUCCESSFUL: "
                    f"Order #{order.orderid}, "
                    f"Transaction {clickpesa_trans.transaction_id}"
                )
                
                return {
                    'success': True,
                    'message': 'Payment completed successfully',
                    'payment': payment,
                    'clickpesa_transaction': clickpesa_trans,
                    'order': order
                }
            
            # FAILED
            elif webhook_status in ['FAILED', 'FAILURE']:
                payment.status = 'failed'
                payment.save()
                
                clickpesa_trans.status = 'failed'
                clickpesa_trans.save()
                
                Notification.objects.create(
                    customerid=payment.customerid,
                    orderid=order,
                    Message=(
                        f'❌ Payment of TSh {payment.amount} '
                        f'failed for Order #{order.orderid}'
                    )
                )
                
                return {
                    'success': False,
                    'message': 'Payment failed',
                    'payment': payment,
                    'clickpesa_transaction': clickpesa_trans
                }
            
            # PENDING / PROCESSING / OTHER
            else:
                normalized_status = webhook_status.lower()
                if normalized_status in ['pending', 'processing', 'initiated']:
                    clickpesa_trans.status = normalized_status
                    clickpesa_trans.save()
                    
                    payment.status = 'pending'
                    payment.save()
                
                return {
                    'success': True,
                    'message': f'Payment status updated: {webhook_status}',
                    'payment': payment,
                    'clickpesa_transaction': clickpesa_trans
                }
                
        except Exception as e:
            print("CLICKPESA WEBHOOK ERROR:", str(e))
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': str(e)
            }
    
    def clean_phone_number(self, phone):
        """
        Clean phone number for Tanzania format
        Converts to format: 255XXXXXXXXX (no leading 0 or +)
        """
        import re
        # Remove spaces, dashes, and plus signs
        phone = re.sub(r'[\s\-+]', '', str(phone))
        
        # If starts with 255, keep as is
        if phone.startswith('255'):
            if len(phone) == 12:
                return phone
            else:
                return None
        
        # If starts with 0, replace with 255
        if phone.startswith('0'):
            if len(phone) == 10:
                return f"255{phone[1:]}"
            else:
                return None
        
        # If starts with 71, 75, 76, 77, 78, then add 255
        if re.match(r'^7[15678]\d{7}$', phone):
            return f"255{phone}"
        
        return None
    
    def get_supported_methods(self):
        """Get list of supported payment methods"""
        return self.supported_methods