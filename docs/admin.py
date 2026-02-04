# docs/admin.py

from django.contrib import admin
from .models import Document, DocumentBlock, Like


class DocumentBlockInline(admin.TabularInline):
    model = DocumentBlock
    extra = 1
    fields = ("block_type", "content", "language", "order")


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "is_published", "order", "created_at")
    list_filter = ("is_published", "created_at")
    search_fields = ("title", "author__username")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [DocumentBlockInline]


@admin.register(DocumentBlock)
class DocumentBlockAdmin(admin.ModelAdmin):
    list_display = ("document", "block_type", "order", "language")
    list_filter = ("block_type", "document")


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ("user", "document", "created_at")
    list_filter = ("created_at",)
