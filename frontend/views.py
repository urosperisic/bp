# frontend.views.py

from django.http import HttpResponse
from django.conf import settings
import os


def index(request):
    html_path = os.path.join(settings.BASE_DIR, "static/frontend/index.html")
    with open(html_path, "r") as f:
        return HttpResponse(f.read())
