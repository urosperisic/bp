# docs/serializers.py

from rest_framework import serializers
from .models import Document, DocumentBlock, Like


class DocumentBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentBlock
        fields = ["id", "block_type", "content", "language", "order"]


class DocumentSerializer(serializers.ModelSerializer):
    blocks = DocumentBlockSerializer(many=True, read_only=True)
    author_username = serializers.CharField(source="author.username", read_only=True)
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            "id",
            "title",
            "slug",
            "author",
            "author_username",
            "is_published",
            "order",
            "created_at",
            "updated_at",
            "blocks",
            "likes_count",
            "is_liked",
        ]
        read_only_fields = ["slug", "author", "created_at", "updated_at"]

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, document=obj).exists()
        return False


class DocumentListSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)
    likes_count = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            "id",
            "title",
            "slug",
            "author_username",
            "is_published",
            "order",
            "likes_count",
        ]

    def get_likes_count(self, obj):
        return obj.likes.count()


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ["id", "user", "document", "created_at"]
        read_only_fields = ["user", "created_at"]
