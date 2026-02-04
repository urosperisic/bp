# frontend/urls.py

from django.urls import re_path
from .views import index

app_name = "frontend"

urlpatterns = [
    re_path(r"^.*$", index, name="index"),
]
