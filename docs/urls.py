# docs/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import DocumentViewSet, DocumentBlockViewSet

router = DefaultRouter()
router.register(r"documents", DocumentViewSet, basename="document")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "documents/<int:document_pk>/blocks/",
        DocumentBlockViewSet.as_view({"get": "list", "post": "create"}),
    ),
    path(
        "documents/<int:document_pk>/blocks/<int:pk>/",
        DocumentBlockViewSet.as_view(
            {"get": "retrieve", "put": "update", "delete": "destroy"}
        ),
    ),
    path(
        "documents/<int:document_pk>/blocks/reorder/",
        DocumentBlockViewSet.as_view({"patch": "reorder"}),
    ),
]
