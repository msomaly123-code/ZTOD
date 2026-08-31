# serializers.py

from rest_framework import serializers
from .models import (
    Customer, Services, Order, Notification, Recepionist, Payment, 
    ServicesItem, ClickPesaTransaction  # Add ClickPesaTransaction here
)

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'


class ServicesItemSerializer(serializers.ModelSerializer):
    """Serializer for ServicesItem (sub-services)"""
    service_name = serializers.CharField(source='service.servicename', read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ServicesItem
        fields = [
            'itemid', 'service', 'service_name', 'itemname', 'description',
            'image', 'image_url', 'price', 'quantity', 'totalprice', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['totalprice', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        if obj.image:
            try:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.image.url)
                return obj.image.url
            except Exception:
                return None
        return None


class ServicesSerializer(serializers.ModelSerializer):
    category_label = serializers.CharField(source='get_category_display', read_only=True)
    items = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Services
        fields = [
            'serviceid', 'servicename', 'category', 'category_label',
            'service_description', 'image', 'image_url', 'status',
            'items', 'item_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_items(self, obj):
        try:
            items = ServicesItem.objects.filter(service=obj, status='active')
            return ServicesItemSerializer(items, many=True, context=self.context).data
        except Exception:
            return []
    
    def get_item_count(self, obj):
        try:
            return ServicesItem.objects.filter(service=obj, status='active').count()
        except Exception:
            return 0
    
    def get_image_url(self, obj):
        if obj.image:
            try:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.image.url)
                return obj.image.url
            except Exception:
                return None
        return None


class OrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customerid.name', read_only=True)
    customer_email = serializers.CharField(source='customerid.email', read_only=True)
    customer_phone = serializers.CharField(source='customerid.phone', read_only=True)
    service_name = serializers.CharField(source='serviceid.servicename', read_only=True)
    service_category = serializers.CharField(source='serviceid.category', read_only=True)
    item_name = serializers.SerializerMethodField()
    item_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = '__all__'
    
    def get_item_name(self, obj):
        if obj.item:
            try:
                return obj.item.itemname
            except Exception:
                return None
        return None
    
    def get_item_price(self, obj):
        if obj.item:
            try:
                return obj.item.price
            except Exception:
                return None
        return None


class NotificationSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customerid.name', read_only=True)
    order_display = serializers.CharField(source='orderid.orderid', read_only=True)
    
    class Meta:
        model = Notification
        fields = '__all__'


class RecepionistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recepionist
        fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='orderid.orderid', read_only=True)
    customer_name = serializers.CharField(source='customerid.name', read_only=True)
    customer_email = serializers.CharField(source='customerid.email', read_only=True)
    order_service = serializers.CharField(source='orderid.serviceid.servicename', read_only=True)
    payment_method_label = serializers.CharField(source='get_paymentmethod_display', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'


# serializers.py - Add ClickPesaTransaction serializer

class ClickPesaTransactionSerializer(serializers.ModelSerializer):
    payment_id = serializers.IntegerField(source='payment.paymentid', read_only=True)
    order_id = serializers.IntegerField(source='order.orderid', read_only=True)
    customer_name = serializers.CharField(source='order.customerid.name', read_only=True)
    
    class Meta:
        model = ClickPesaTransaction
        fields = [
            'transaction_id', 'payment', 'payment_id', 'order', 'order_id',
            'amount', 'payment_method', 'status', 'mobile_number',
            'reference', 'customer_name', 'created_at', 'updated_at'
        ]