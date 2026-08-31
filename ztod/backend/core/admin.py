from django.contrib import admin
from .models import Customer, Services, Order, Notification, Recepionist, Payment,ServicesItem

admin.site.register(Customer)
admin.site.register(Services)
admin.site.register(Order)
admin.site.register(Notification)
admin.site.register(Recepionist)
admin.site.register(Payment)
admin.site.register(ServicesItem)