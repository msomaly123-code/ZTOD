# views.py
# core/views.py
import json
import requests
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, SAFE_METHODS
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.hashers import check_password, make_password
from django.db.models import Sum, Q, Count
from django.http import JsonResponse
from django.shortcuts import render
from datetime import datetime, timedelta
from .models import (
    Customer, Services, Order, Notification, Recepionist, Payment, ServicesItem
)
from .serializers import (
    CustomerSerializer, ServicesSerializer, OrderSerializer,
    NotificationSerializer, RecepionistSerializer, PaymentSerializer,
    ServicesItemSerializer
)
from .services.clickpesa_service import ClickPesaService

# ==================== CUSTOM PERMISSION FOR PUBLIC READ ====================

class PublicReadOnlyPermission(permissions.BasePermission):
    """
    Custom permission to allow public read-only access (GET, HEAD, OPTIONS)
    but require authentication for write operations (POST, PUT, PATCH, DELETE)
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated


# ==================== AUTHENTICATION VIEWS ====================

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user (Customer or Receptionist)"""
    role = request.data.get('role', 'customer')
    name = request.data.get('name')
    email = request.data.get('email')
    password = request.data.get('password')
    phone = request.data.get('phone', '')
    address = request.data.get('address', '')
    houseno = request.data.get('houseno', '')
    
    if not name or not email or not password:
        return Response(
            {'error': 'Name, email, and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    import re
    if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
        return Response(
            {'error': 'Please enter a valid email address'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if Customer.objects.filter(email=email).exists() or Recepionist.objects.filter(email=email).exists():
        return Response(
            {'error': 'Email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        with transaction.atomic():
            if role == 'receptionist':
                receptionist = Recepionist.objects.create(
                    name=name,
                    email=email,
                    password=password,
                    phone=phone
                )
                receptionist.refresh_from_db()
                token, _ = Token.objects.get_or_create(user=receptionist.user)
                
                return Response({
                    'message': 'Receptionist registered successfully',
                    'token': token.key,
                    'user': {
                        'id': receptionist.recepionistid,
                        'name': receptionist.name,
                        'email': receptionist.email,
                        'phone': receptionist.phone,
                        'role': 'receptionist'
                    }
                }, status=status.HTTP_201_CREATED)
                
            else:
                customer = Customer.objects.create(
                    name=name,
                    email=email,
                    password=password,
                    phone=phone,
                    address=address,
                    houseno=houseno,
                    status='active'
                )
                customer.refresh_from_db()
                token, _ = Token.objects.get_or_create(user=customer.user)
                
                return Response({
                    'message': 'Customer registered successfully',
                    'token': token.key,
                    'user': {
                        'id': customer.customerid,
                        'name': customer.name,
                        'email': customer.email,
                        'phone': customer.phone,
                        'address': customer.address,
                        'houseno': customer.houseno,
                        'role': 'customer'
                    }
                }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """Login user with role, email, and password"""
    role = request.data.get('role')
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not role or not email or not password:
        return Response(
            {'error': 'Role, email, and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        if role.lower() == 'receptionist':
            try:
                receptionist = Recepionist.objects.get(email=email)
                
                if check_password(password, receptionist.password):
                    if not receptionist.user:
                        user = User.objects.create_user(
                            username=email,
                            email=email,
                            password=password
                        )
                        receptionist.user = user
                        receptionist.save()
                    else:
                        user = receptionist.user
                    
                    token, _ = Token.objects.get_or_create(user=user)
                    
                    return Response({
                        'message': 'Login successful',
                        'token': token.key,
                        'user': {
                            'id': receptionist.recepionistid,
                            'name': receptionist.name,
                            'email': receptionist.email,
                            'phone': receptionist.phone,
                            'role': 'receptionist'
                        },
                        'role': 'receptionist'
                    })
                else:
                    return Response(
                        {'error': 'Invalid credentials'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
            except Recepionist.DoesNotExist:
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
                
        elif role.lower() == 'customer':
            try:
                customer = Customer.objects.get(email=email)
                
                if check_password(password, customer.password):
                    if not customer.user:
                        user = User.objects.create_user(
                            username=email,
                            email=email,
                            password=password
                        )
                        customer.user = user
                        customer.save()
                    else:
                        user = customer.user
                    
                    token, _ = Token.objects.get_or_create(user=user)
                    
                    return Response({
                        'message': 'Login successful',
                        'token': token.key,
                        'user': {
                            'id': customer.customerid,
                            'name': customer.name,
                            'email': customer.email,
                            'phone': customer.phone,
                            'address': customer.address,
                            'houseno': customer.houseno,
                            'status': customer.status,
                            'role': 'customer'
                        },
                        'role': 'customer'
                    })
                else:
                    return Response(
                        {'error': 'Invalid credentials'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
            except Customer.DoesNotExist:
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        else:
            return Response(
                {'error': 'Invalid role. Must be "customer" or "receptionist"'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """Get current logged-in user details"""
    user = request.user
    
    try:
        customer = Customer.objects.get(user=user)
        return Response({
            'id': customer.customerid,
            'name': customer.name,
            'email': customer.email,
            'role': 'customer',
            'phone': customer.phone,
            'address': customer.address,
            'houseno': customer.houseno,
            'status': customer.status
        })
    except Customer.DoesNotExist:
        pass
    
    try:
        receptionist = Recepionist.objects.get(user=user)
        return Response({
            'id': receptionist.recepionistid,
            'name': receptionist.name,
            'email': receptionist.email,
            'role': 'receptionist',
            'phone': receptionist.phone
        })
    except Recepionist.DoesNotExist:
        pass
    
    return Response(
        {'error': 'User not found'},
        status=status.HTTP_404_NOT_FOUND
    )


# ==================== CUSTOMER VIEWSET ====================

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        status_param = self.request.query_params.get('status')
        search = self.request.query_params.get('search')
        
        if status_param:
            queryset = queryset.filter(status=status_param)
        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(email__icontains=search)
        return queryset
    
    def perform_create(self, serializer):
        customer = serializer.save()
        Notification.objects.create(
            customerid=customer,
            Message=f'New customer created: {customer.name}'
        )
    
    def perform_update(self, serializer):
        customer = serializer.save()
        Notification.objects.create(
            customerid=customer,
            Message=f'Customer updated: {customer.name}'
        )
    
    def perform_destroy(self, instance):
        name = instance.name
        instance.delete()
        Notification.objects.create(
            Message=f'Customer deleted: {name}'
        )
    
    @action(detail=True, methods=['get'])
    def orders(self, request, pk=None):
        customer = self.get_object()
        orders = Order.objects.filter(customerid=customer)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        customers = Customer.objects.filter(status='active')
        serializer = self.get_serializer(customers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def count(self, request):
        return Response({
            'total': Customer.objects.count(),
            'active': Customer.objects.filter(status='active').count(),
            'inactive': Customer.objects.filter(status='inactive').count()
        })
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        customer = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'Status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_status not in ['active', 'inactive']:
            return Response(
                {'error': 'Status must be "active" or "inactive"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = customer.status
        customer.status = new_status
        customer.save()
        
        Notification.objects.create(
            customerid=customer,
            Message=f'Customer {customer.name} status changed from {old_status} to {new_status}'
        )
        
        return Response({
            'message': 'Customer status updated successfully',
            'customerid': customer.customerid,
            'name': customer.name,
            'old_status': old_status,
            'new_status': new_status
        })
    
    # ✅ UPDATE CUSTOMER WITH PASSWORD SUPPORT
    @action(detail=True, methods=['put', 'patch'], url_path='update_customer')
    def update_customer(self, request, pk=None):
        """Update customer information - Custom action with password support"""
        try:
            customer = self.get_object()
            data = request.data
            
            # Validate email if provided
            if 'email' in data and data['email']:
                if Customer.objects.filter(email=data['email']).exclude(customerid=customer.customerid).exists():
                    return Response({
                        'success': False,
                        'error': 'Email already exists'
                    }, status=400)
                customer.email = data['email']
                if customer.user:
                    customer.user.email = data['email']
                    customer.user.username = data['email']
                    customer.user.save()
            
            # Update name
            if 'name' in data:
                customer.name = data['name']
                if customer.user:
                    customer.user.first_name = data['name']
                    customer.user.save()
            
            # Update phone with validation
            if 'phone' in data:
                import re
                phone_clean = re.sub(r'[\s-]', '', data['phone'])
                if not re.match(r'^(\+255|0)[0-9]{9}$', phone_clean):
                    return Response({
                        'success': False,
                        'error': 'Enter a valid phone number (e.g., 0712345678 or +255712345678)'
                    }, status=400)
                customer.phone = data['phone']
            
            # Update address
            if 'address' in data:
                customer.address = data['address']
            
            # Update houseno
            if 'houseno' in data:
                customer.houseno = data['houseno']
            
            # Update status with validation
            if 'status' in data:
                if data['status'] not in ['active', 'inactive']:
                    return Response({
                        'success': False,
                        'error': 'Status must be "active" or "inactive"'
                    }, status=400)
                customer.status = data['status']
            
            # ✅ Handle password update with proper hashing
            if 'password' in data and data['password']:
                if len(data['password']) < 6:
                    return Response({
                        'success': False,
                        'error': 'Password must be at least 6 characters'
                    }, status=400)
                
                # Hash the password using Django's make_password
                customer.password = make_password(data['password'])
                
                # Update the associated user's password
                if customer.user:
                    customer.user.set_password(data['password'])
                    customer.user.save()
            
            customer.save()
            
            Notification.objects.create(
                customerid=customer,
                Message=f'Customer updated: {customer.name}'
            )
            
            return Response({
                'success': True,
                'message': 'Customer updated successfully',
                'data': CustomerSerializer(customer).data
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=500)


# ==================== SERVICES VIEWSET ====================

class ServicesViewSet(viewsets.ModelViewSet):
    """
    Services ViewSet with public read access.
    Anyone can view services (GET), but only authenticated users can create, update, or delete.
    """
    queryset = Services.objects.all()
    serializer_class = ServicesSerializer
    permission_classes = [PublicReadOnlyPermission]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        status_param = self.request.query_params.get('status')
        search = self.request.query_params.get('search')
        category = self.request.query_params.get('category')
        
        if not status_param and not self.request.user.is_authenticated:
            queryset = queryset.filter(status='active')
        
        if status_param:
            queryset = queryset.filter(status=status_param)
        if search:
            queryset = queryset.filter(servicename__icontains=search)
        if category:
            queryset = queryset.filter(category=category)
        return queryset
    
    def perform_create(self, serializer):
        service = serializer.save()
        Notification.objects.create(
            Message=f'New service added: {service.servicename}'
        )
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        services = Services.objects.filter(status='active')
        serializer = self.get_serializer(services, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        categories = {}
        for cat in Services.Category.choices:
            services = Services.objects.filter(
                category=cat[0], 
                status='active'
            )
            if services.exists():
                categories[cat[0]] = {
                    'label': cat[1],
                    'services': ServicesSerializer(services, many=True, context={'request': request}).data
                }
        return Response(categories)
    
    @action(detail=False, methods=['get'])
    def items(self, request):
        category = request.query_params.get('category')
        if not category:
            return Response(
                {'error': 'category parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        items = ServicesItem.objects.filter(
            service__category=category,
            status='active'
        )
        serializer = ServicesItemSerializer(items, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def service_items(self, request, pk=None):
        service = self.get_object()
        items = ServicesItem.objects.filter(service=service, status='active')
        serializer = ServicesItemSerializer(items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get popular services based on order count"""
        popular_services = Services.objects.annotate(
            order_count=Count(
                'orders',
                filter=Q(orders__status__in=['completed', 'paid'])
            )
        ).filter(
            status='active'
        ).order_by('-order_count')[:6]
        
        if not popular_services or popular_services.filter(order_count=0).count() == popular_services.count():
            popular_services = Services.objects.filter(
                status='active'
            ).annotate(
                item_count=Count('items', filter=Q(items__status='active'))
            ).filter(
                item_count__gt=0
            ).order_by('-item_count')[:6]
        
        result = []
        for service in popular_services:
            data = self.get_serializer(service, context={'request': request}).data
            data['order_count'] = getattr(service, 'order_count', 0)
            data['item_count'] = service.items.filter(status='active').count()
            result.append(data)
        
        return Response(result)


# ==================== SERVICES ITEM VIEWSET ====================

class ServicesItemViewSet(viewsets.ModelViewSet):
    queryset = ServicesItem.objects.all()
    serializer_class = ServicesItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        service_id = self.request.query_params.get('service_id')
        status_param = self.request.query_params.get('status')
        
        if service_id:
            queryset = queryset.filter(service_id=service_id)
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset
    
    def perform_create(self, serializer):
        item = serializer.save()
        Notification.objects.create(
            Message=f'New service item added: {item.itemname}'
        )
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        item = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'Status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_status not in ['active', 'inactive']:
            return Response(
                {'error': 'Status must be "active" or "inactive"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        item.status = new_status
        item.save()
        
        return Response({
            'message': 'Item status updated successfully',
            'itemid': item.itemid,
            'status': new_status
        })


# ==================== ORDER VIEWSET ====================

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().select_related('customerid', 'serviceid', 'item')
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        status_param = self.request.query_params.get('status')
        customer_id = self.request.query_params.get('customerid')
        search = self.request.query_params.get('search')
        
        user = self.request.user
        try:
            customer = Customer.objects.get(user=user)
            queryset = queryset.filter(customerid=customer)
        except Customer.DoesNotExist:
            pass
        
        if status_param:
            queryset = queryset.filter(status=status_param)
        if customer_id:
            queryset = queryset.filter(customerid=customer_id)
        if search:
            queryset = queryset.filter(
                Q(orderid__icontains=search) |
                Q(customerid__name__icontains=search) |
                Q(customerid__email__icontains=search)
            )
        return queryset
    
    def perform_create(self, serializer):
        order = serializer.save()
        Notification.objects.create(
            customerid=order.customerid,
            orderid=order,
            Message=f'New order created: Order #{order.orderid}'
        )
    
    def perform_update(self, serializer):
        order = serializer.save()
        Notification.objects.create(
            customerid=order.customerid,
            orderid=order,
            Message=f'Order #{order.orderid} updated'
        )
    
    def perform_destroy(self, instance):
        order_id = instance.orderid
        customer = instance.customerid
        instance.delete()
        Notification.objects.create(
            customerid=customer,
            Message=f'Order #{order_id} deleted'
        )
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'Status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        valid_statuses = ['pending', 'processing', 'completed', 'cancelled', 'paid']
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Choose from: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = order.status
        order.status = new_status
        order.save()
        
        Notification.objects.create(
            customerid=order.customerid,
            orderid=order,
            Message=f'Order #{order.orderid} status changed from {old_status} to {new_status}'
        )
        
        return Response({
            'message': 'Order status updated successfully',
            'orderid': order.orderid,
            'old_status': old_status,
            'new_status': new_status
        })
    
    @action(detail=False, methods=['get'])
    def customer_orders(self, request):
        customer_id = request.query_params.get('customerid')
        if not customer_id:
            return Response(
                {'error': 'customerid is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        orders = Order.objects.filter(customerid=customer_id)
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = Order.objects.count()
        pending = Order.objects.filter(status='pending').count()
        processing = Order.objects.filter(status='processing').count()
        completed = Order.objects.filter(status='completed').count()
        cancelled = Order.objects.filter(status='cancelled').count()
        paid = Order.objects.filter(status='paid').count()
        
        total_revenue = Order.objects.filter(status='completed').aggregate(
            total=Sum('totalAmount')
        )['total'] or 0
        
        week_ago = datetime.now() - timedelta(days=7)
        this_week = Order.objects.filter(created_at__gte=week_ago).count()
        
        return Response({
            'total': total,
            'pending': pending,
            'processing': processing,
            'completed': completed,
            'cancelled': cancelled,
            'paid': paid,
            'totalRevenue': total_revenue,
            'thisWeek': this_week,
        })


# ==================== NOTIFICATION VIEWSET ====================

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().select_related('customerid', 'orderid')
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        customer_id = self.request.query_params.get('customerid')
        
        user = self.request.user
        try:
            customer = Customer.objects.get(user=user)
            queryset = queryset.filter(customerid=customer)
        except Customer.DoesNotExist:
            pass
        
        if customer_id:
            queryset = queryset.filter(customerid=customer_id)
        
        return queryset.order_by('-date')
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        user = request.user
        try:
            customer = Customer.objects.get(user=user)
            count = Notification.objects.filter(customerid=customer, is_read=False).update(is_read=True)
            return Response({'message': f'Marked {count} notifications as read'})
        except Customer.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)


# ==================== RECEPTIONIST VIEWSET ====================

class RecepionistViewSet(viewsets.ModelViewSet):
    queryset = Recepionist.objects.all()
    serializer_class = RecepionistSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        receptionist = serializer.save()
        Notification.objects.create(
            Message=f'New receptionist added: {receptionist.name}'
        )


# ==================== PAYMENT VIEWSET ====================

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().select_related('orderid', 'customerid')
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        order_id = self.request.query_params.get('orderid')
        status_param = self.request.query_params.get('status')
        customer_id = self.request.query_params.get('customerid')
        
        user = self.request.user
        try:
            customer = Customer.objects.get(user=user)
            queryset = queryset.filter(customerid=customer)
        except Customer.DoesNotExist:
            pass
        
        if order_id:
            queryset = queryset.filter(orderid=order_id)
        if status_param:
            queryset = queryset.filter(status=status_param)
        if customer_id:
            queryset = queryset.filter(customerid=customer_id)
        return queryset
    
    def perform_create(self, serializer):
        payment = serializer.save()
        order = payment.orderid
        order.status = 'paid'
        order.save()
        
        Notification.objects.create(
            customerid=payment.customerid,
            orderid=order,
            Message=f'Payment of TSh {payment.amount} processed for order #{order.orderid}'
        )
    
    @action(detail=False, methods=['post'])
    def process_payment(self, request):
        order_id = request.data.get('orderid')
        amount = request.data.get('amount')
        paymentmethod = request.data.get('paymentmethod', 'M-Pesa')
        customer_id = request.data.get('customerid')
        
        if not order_id or not amount or not customer_id:
            return Response(
                {'error': 'orderid, customerid, and amount are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                order = Order.objects.get(orderid=order_id)
                customer = Customer.objects.get(customerid=customer_id)
                
                if order.status == 'paid':
                    return Response(
                        {'error': 'Order already paid'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                if float(amount) != float(order.totalAmount):
                    return Response(
                        {'error': 'Payment amount does not match order total'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                payment = Payment.objects.create(
                    orderid=order,
                    customerid=customer,
                    amount=amount,
                    paymentmethod=paymentmethod,
                    status='completed'
                )
                
                order.status = 'paid'
                order.save()
                
                Notification.objects.create(
                    customerid=customer,
                    orderid=order,
                    Message=f'Payment of TSh {amount} processed for order #{order_id}'
                )
                
                return Response({
                    'status': 'success',
                    'paymentid': payment.paymentid,
                    'message': 'Payment processed successfully',
                    'order_status': order.status
                })
                
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Customer.DoesNotExist:
            return Response(
                {'error': 'Customer not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = request.user
        
        try:
            customer = Customer.objects.get(user=user)
            payments = Payment.objects.filter(customerid=customer)
        except Customer.DoesNotExist:
            payments = Payment.objects.all()
        
        total = payments.count()
        completed = payments.filter(status='completed').count()
        pending = payments.filter(status='pending').count()
        failed = payments.filter(status='failed').count()
        refunded = payments.filter(status='refunded').count()
        
        total_amount = payments.filter(status='completed').aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        today = datetime.now().date()
        today_amount = payments.filter(
            status='completed',
            date__date=today
        ).aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        week_ago = datetime.now() - timedelta(days=7)
        week_amount = payments.filter(
            status='completed',
            date__gte=week_ago
        ).aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        month_ago = datetime.now() - timedelta(days=30)
        month_amount = payments.filter(
            status='completed',
            date__gte=month_ago
        ).aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        return Response({
            'total': total,
            'completed': completed,
            'pending': pending,
            'failed': failed,
            'refunded': refunded,
            'totalAmount': total_amount,
            'todayAmount': today_amount,
            'weekAmount': week_amount,
            'monthAmount': month_amount,
        })
    
    @action(detail=True, methods=['post'])
    def refund(self, request, pk=None):
        payment = self.get_object()
        
        if payment.status != 'completed':
            return Response(
                {'error': 'Only completed payments can be refunded'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment.status = 'refunded'
        payment.save()
        
        order = payment.orderid
        order.status = 'cancelled'
        order.save()
        
        Notification.objects.create(
            customerid=payment.customerid,
            orderid=order,
            Message=f'Refund of TSh {payment.amount} processed for order #{order.orderid}'
        )
        
        return Response({
            'message': 'Payment refunded successfully',
            'paymentid': payment.paymentid,
            'status': payment.status
        })


# ==================== UPDATE PASSWORD ====================

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_password(request):
    """Update user password"""
    user = request.user
    new_password = request.data.get('new_password')
    
    if not new_password:
        return Response(
            {'error': 'New password is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if len(new_password) < 6:
        return Response(
            {'error': 'New password must be at least 6 characters'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user.set_password(new_password)
    user.save()
    
    try:
        receptionist = Recepionist.objects.get(user=user)
        receptionist.password = user.password
        receptionist.save()
    except Recepionist.DoesNotExist:
        pass
    
    try:
        customer = Customer.objects.get(user=user)
        customer.password = user.password
        customer.save()
    except Customer.DoesNotExist:
        pass
    
    return Response({
        'message': 'Password updated successfully'
    })


# ==================== UPDATE RECEPTIONIST PROFILE ====================

@csrf_exempt
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_receptionist_profile(request):
    """Update receptionist profile"""
    try:
        user = request.user
        receptionist = Recepionist.objects.get(user=user)
        
        name = request.data.get('name')
        phone = request.data.get('phone')
        password = request.data.get('password')
        
        if name:
            receptionist.name = name
            user.first_name = name
            user.save()
        
        if phone:
            import re
            phone_clean = re.sub(r'[\s-]', '', phone)
            if not re.match(r'^(\+255|0)[0-9]{9}$', phone_clean):
                return Response(
                    {'error': 'Enter a valid phone number (e.g., 0712345678 or +255712345678)'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            receptionist.phone = phone
        
        if password:
            if len(password) < 6:
                return Response(
                    {'error': 'Password must be at least 6 characters'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(password)
            user.save()
            receptionist.password = user.password
        
        receptionist.save()
        
        return Response({
            'message': 'Profile updated successfully',
            'user': {
                'id': receptionist.recepionistid,
                'name': receptionist.name,
                'email': receptionist.email,
                'phone': receptionist.phone,
                'role': 'receptionist'
            }
        })
        
    except Recepionist.DoesNotExist:
        return Response(
            {'error': 'Receptionist not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==================== CLICKPESA PAYMENT VIEWS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_supported_payment_methods(request):
    """Get list of supported payment methods"""
    try:
        clickpesa = ClickPesaService()
        return Response({
            'success': True,
            'payment_methods': clickpesa.get_supported_methods()
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    """Initiate a payment for an order using ClickPesa"""
    try:
        data = request.data
        order_id = data.get('order_id')
        payment_method = data.get('payment_method', 'tigo_pesa')
        mobile_number = data.get('mobile_number', '')
        
        print("=" * 50)
        print("📝 INITIATE PAYMENT REQUEST")
        print(f"Order ID: {order_id}")
        print(f"Payment Method: {payment_method}")
        print(f"Mobile Number: {mobile_number}")
        print("=" * 50)
        
        if payment_method not in ['tigo_pesa', 'airtel_money']:
            return Response({
                'success': False,
                'error': 'Invalid payment method. Supported: Tigo Pesa, Airtel Money'
            }, status=400)
        
        try:
            order = Order.objects.get(orderid=order_id, customerid__user=request.user)
            print(f"✅ Order found: #{order.orderid} - {order.totalAmount} TSh")
        except Order.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Order not found'
            }, status=404)
        
        if order.status in ['paid', 'completed']:
            return Response({
                'success': False,
                'error': 'Order already paid'
            }, status=400)
        
        clickpesa = ClickPesaService()
        result = clickpesa.create_payment(
            order=order,
            payment_method=payment_method,
            mobile_number=mobile_number
        )
        
        print(f"📤 ClickPesa Response: {result}")
        
        if result.get('success'):
            return Response({
                'success': True,
                'message': 'Payment initiated successfully',
                'data': {
                    'transaction_id': result.get('transaction_id'),
                    'payment_url': result.get('payment_url', ''),
                    'redirect_url': result.get('redirect_url', ''),
                    'amount': str(order.totalAmount),
                    'payment_method': payment_method,
                    'mobile_number': mobile_number
                }
            })
        else:
            return Response({
                'success': False,
                'error': result.get('error', 'Payment initiation failed')
            }, status=400)
            
    except Exception as e:
        print(f"❌ Initiate Payment Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verify_payment(request, transaction_id):
    """Verify payment status"""
    try:
        print("=" * 50)
        print(f"🔍 VERIFY PAYMENT: {transaction_id}")
        print("=" * 50)
        
        clickpesa = ClickPesaService()
        result = clickpesa.verify_payment(transaction_id)
        
        print(f"📤 Verify Result: {result}")
        
        if result.get('success'):
            return Response({
                'success': True,
                'status': result.get('status'),
                'payment': PaymentSerializer(result.get('payment')).data if result.get('payment') else None
            })
        else:
            return Response({
                'success': False,
                'error': result.get('error', 'Verification failed')
            }, status=400)
            
    except Exception as e:
        print(f"❌ Verify Payment Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def payment_webhook(request):
    """Handle ClickPesa webhook callback"""
    print("=" * 60)
    print("📨 CLICKPESA WEBHOOK RECEIVED")
    print("Headers:", dict(request.headers))
    print("Body:", request.body.decode("utf-8", errors="replace"))
    print("=" * 60)
    
    try:
        data = json.loads(request.body.decode("utf-8"))
        print("📊 Parsed Data:", json.dumps(data, indent=2))
        
        clickpesa = ClickPesaService()
        result = clickpesa.handle_webhook(data)
        
        print("📤 Webhook Result:", json.dumps(result, indent=2, default=str))
        
        if result.get('success'):
            return JsonResponse({
                'status': 'success',
                'message': result.get('message', 'Webhook processed successfully')
            }, status=200)
        else:
            return JsonResponse({
                'status': 'error',
                'message': result.get('error', 'Webhook processing failed')
            }, status=400)
            
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        print(f"❌ Webhook Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def payment_confirm(request):
    """Confirm payment after redirect"""
    transaction_id = request.GET.get('transaction_id')
    status_param = request.GET.get('status', '')
    
    print("=" * 50)
    print(f"🔗 PAYMENT CONFIRM: {transaction_id} - {status_param}")
    print("=" * 50)
    
    context = {
        'transaction_id': transaction_id,
        'status': status_param,
        'message': '',
        'success': False
    }
    
    if transaction_id:
        try:
            clickpesa = ClickPesaService()
            result = clickpesa.verify_payment(transaction_id)
            
            print(f"📤 Confirm Result: {result}")
            
            if result.get('success') and result.get('status') == 'completed':
                context['message'] = '✅ Payment completed successfully!'
                context['success'] = True
            elif result.get('success'):
                context['message'] = f'Payment status: {result.get("status")}'
                context['success'] = False
            else:
                context['message'] = result.get('error', 'Payment verification failed')
                context['success'] = False
        except Exception as e:
            print(f"❌ Confirm Error: {str(e)}")
            context['message'] = f'Error verifying payment: {str(e)}'
            context['success'] = False
    else:
        context['message'] = 'No transaction ID provided'
        context['success'] = False
    
    return render(request, 'payment_confirm.html', context)


# ==================== CREATE ORDER VIEW ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    """Create a new order"""
    try:
        data = request.data
        
        print("=" * 50)
        print("📝 CREATE ORDER REQUEST")
        print(f"Data: {data}")
        print("=" * 50)
        
        try:
            customer = Customer.objects.get(user=request.user)
            print(f"✅ Customer found: {customer.customerid} - {customer.name}")
        except Customer.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Customer profile not found'
            }, status=404)
        
        service_id = data.get('service_id')
        item_id = data.get('item_id')
        
        if not service_id or not item_id:
            return Response({
                'success': False,
                'error': 'service_id and item_id are required'
            }, status=400)
        
        try:
            service = Services.objects.get(serviceid=service_id)
            print(f"✅ Service found: {service.servicename}")
        except Services.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Service not found'
            }, status=404)
        
        try:
            service_item = ServicesItem.objects.get(itemid=item_id)
            print(f"✅ Service Item found: {service_item.itemname}")
        except ServicesItem.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Service item not found'
            }, status=404)
        
        quantity = data.get('quantity', 1)
        total_amount = data.get('total_amount', service_item.price * quantity)
        
        order = Order.objects.create(
            customerid=customer,
            serviceid=service,
            item=service_item,
            quantity=quantity,
            totalAmount=total_amount,
            status='pending',
            notes=data.get('notes', '')
        )
        
        print(f"✅ Order created: #{order.orderid} - {total_amount} TSh")
        
        Notification.objects.create(
            customerid=customer,
            orderid=order,
            Message=f'New order created: #{order.orderid} - {service.servicename}'
        )
        
        return Response({
            'success': True,
            'message': 'Order created successfully',
            'data': {
                'order_id': order.orderid,
                'customer_id': customer.customerid,
                'service': service.servicename,
                'item': service_item.itemname,
                'quantity': order.quantity,
                'total_amount': order.totalAmount,
                'status': order.status,
                'created_at': order.created_at
            }
        })
        
    except Exception as e:
        print(f"❌ Create Order Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)