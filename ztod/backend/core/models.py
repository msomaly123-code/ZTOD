# models.py
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.hashers import make_password

# ==================== CUSTOMER MODEL ====================

class Customer(models.Model):
    customerid = models.AutoField(primary_key=True)
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True
    )
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=50, default='active')
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    address = models.CharField(max_length=255, blank=True, null=True)
    houseno = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'customer'


# ==================== SERVICES MODEL ====================

class Services(models.Model):
    class Category(models.TextChoices):
        LAUNDRY = 'laundry', 'Laundry'
        CONFERENCES = 'conferences', 'Conferences'
        CATERING = 'catering', 'Catering'
        ROOM_BOOKING = 'room_booking', 'Room Booking'
    
    serviceid = models.AutoField(primary_key=True)
    servicename = models.CharField(max_length=255)
    category = models.CharField(
        max_length=50, 
        choices=Category.choices,
        default=Category.LAUNDRY
    )
    service_description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='services/', blank=True, null=True)
    status = models.CharField(max_length=50, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.servicename
    
    class Meta:
        db_table = 'services'
        ordering = ['category', 'servicename']


# ==================== SERVICES ITEM MODEL ====================

class ServicesItem(models.Model):
    itemid = models.AutoField(primary_key=True)
    service = models.ForeignKey(
        Services,
        on_delete=models.CASCADE,
        related_name='items',
        null=True,
        blank=True
    )
    itemname = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='services/', blank=True, null=True)
    price = models.DecimalField(max_digits=30, decimal_places=2)
    quantity = models.IntegerField(default=1)
    totalprice = models.DecimalField(max_digits=30, decimal_places=2, blank=True, null=True)
    status = models.CharField(max_length=50, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if self.price and self.quantity:
            self.totalprice = self.price * self.quantity
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.itemname
    
    class Meta:
        db_table = 'services_item'
        ordering = ['itemname']


# ==================== ORDER MODEL ====================

class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
        PAID = 'paid', 'Paid'
    
    orderid = models.AutoField(primary_key=True)
    customerid = models.ForeignKey(
        Customer, 
        on_delete=models.CASCADE,
        db_column='customerid',
        related_name='orders'
    )
    serviceid = models.ForeignKey(
        Services, 
        on_delete=models.CASCADE,
        db_column='serviceid',
        related_name='orders',
        null=True,
        blank=True
    )
    item = models.ForeignKey(
        ServicesItem,
        on_delete=models.SET_NULL,
        related_name='orders',
        null=True,
        blank=True
    )
    quantity = models.IntegerField(default=1)
    totalAmount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20, 
        choices=Status.choices,
        default=Status.PENDING
    )
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if self.item and not self.totalAmount:
            self.totalAmount = self.item.price * self.quantity
        super().save(*args, **kwargs)
    
    class Meta:
        db_table = 'order'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order #{self.orderid}"


# ==================== NOTIFICATION MODEL ====================

class Notification(models.Model):
    notificationid = models.AutoField(primary_key=True)
    Message = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    customerid = models.ForeignKey(
        Customer, 
        on_delete=models.CASCADE,
        db_column='customerid',
        related_name='notifications',
        null=True,
        blank=True
    )
    orderid = models.ForeignKey(
        Order, 
        on_delete=models.CASCADE,
        db_column='orderid',
        related_name='notifications',
        null=True,
        blank=True
    )
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Notification #{self.notificationid}"
    
    class Meta:
        db_table = 'notification'


# ==================== RECEPTIONIST MODEL ====================

class Recepionist(models.Model):
    recepionistid = models.AutoField(primary_key=True)
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True
    )
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'recepionist'


# ==================== PAYMENT MODEL ====================

class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'
        REFUNDED = 'refunded', 'Refunded'
    
    class Method(models.TextChoices):
        TIGO_PESA = 'tigo_pesa', 'Tigo Pesa'
        AIRTEL_MONEY = 'airtel_money', 'Airtel Money'
        CASH = 'cash', 'Cash'
        BANK_TRANSFER = 'bank_transfer', 'Bank Transfer'
    
    paymentid = models.AutoField(primary_key=True)
    orderid = models.ForeignKey(
        Order, 
        on_delete=models.CASCADE,
        db_column='orderid',
        related_name='payments'
    )
    customerid = models.ForeignKey(
        Customer, 
        on_delete=models.CASCADE,
        db_column='customerid',
        related_name='payments'
    )
    date = models.DateTimeField(auto_now_add=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20, 
        choices=Status.choices,
        default=Status.PENDING
    )
    paymentmethod = models.CharField(
        max_length=20,
        choices=Method.choices,
        default=Method.TIGO_PESA
    )
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    mobile_number = models.CharField(max_length=15, blank=True, null=True)
    clickpesa_response = models.JSONField(blank=True, null=True)
    
    def __str__(self):
        return f"Payment #{self.paymentid} - TSh {self.amount}"
    
    class Meta:
        db_table = 'payment'
        ordering = ['-date']


# ==================== CLICKPESA TRANSACTION MODEL ====================

class ClickPesaTransaction(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    transaction_id = models.CharField(max_length=100, unique=True)
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name='clickpesa_transactions'
    )
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='clickpesa_transactions'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    mobile_number = models.CharField(max_length=15, blank=True, null=True)
    reference = models.CharField(max_length=100, blank=True, null=True)
    request_data = models.JSONField(blank=True, null=True)
    response_data = models.JSONField(blank=True, null=True)
    callback_data = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'clickpesa_transactions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.transaction_id} - {self.status}"


# ==================== SIGNALS ====================

@receiver(post_save, sender=Customer)
def create_user_for_customer(sender, instance, created, **kwargs):
    """Create Django User when Customer is created"""
    if created and not instance.user:
        user = User.objects.create_user(
            username=instance.email,
            email=instance.email,
            password=instance.password,
            first_name=instance.name
        )
        instance.user = user
        instance.password = user.password
        instance.save()


@receiver(post_save, sender=Recepionist)
def create_user_for_receptionist(sender, instance, created, **kwargs):
    """Create Django User when Receptionist is created"""
    if created and not instance.user:
        user = User.objects.create_user(
            username=instance.email,
            email=instance.email,
            password=instance.password,
            first_name=instance.name
        )
        instance.user = user
        instance.password = user.password
        instance.save()