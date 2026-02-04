# docs/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Document, DocumentBlock, Like
from .serializers import (
    DocumentSerializer,
    DocumentListSerializer,
    DocumentBlockSerializer,
)
from .permissions import IsAdminOrReadOnly, IsAdminUser


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.filter(is_published=True)
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action == "list":
            return DocumentListSerializer
        return DocumentSerializer

    def get_queryset(self):
        if self.request.user.role == "admin":
            return Document.objects.all()
        return Document.objects.filter(is_published=True)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def like(self, request, slug=None):
        document = self.get_object()
        like, created = Like.objects.get_or_create(user=request.user, document=document)

        if not created:
            like.delete()
            return Response({"status": "unliked"}, status=status.HTTP_200_OK)

        return Response({"status": "liked"}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["patch"], permission_classes=[IsAdminUser])
    def reorder(self, request):
        """
        [{"id": 1, "order": 0}, {"id": 2, "order": 1}, ...]
        """
        items = request.data.get("items", [])
        for item in items:
            Document.objects.filter(id=item["id"]).update(order=item["order"])
        return Response({"status": "reordered"}, status=status.HTTP_200_OK)


class DocumentBlockViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentBlockSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        document_id = self.kwargs.get("document_pk")
        return DocumentBlock.objects.filter(document_id=document_id)

    def perform_create(self, serializer):
        document_id = self.kwargs.get("document_pk")
        document = get_object_or_404(Document, pk=document_id)
        serializer.save(document=document)

    @action(detail=False, methods=["patch"])
    def reorder(self, request, document_pk=None):
        """
        [{"id": 1, "order": 0}, {"id": 2, "order": 1}, ...]
        """
        items = request.data.get("items", [])
        for item in items:
            DocumentBlock.objects.filter(id=item["id"]).update(order=item["order"])
        return Response({"status": "reordered"}, status=status.HTTP_200_OK)
