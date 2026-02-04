# docs/models.py

from django.db import models
from django.conf import settings
from django.utils.text import slugify


class Document(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_published = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class DocumentBlock(models.Model):
    BLOCK_TYPES = (
        ("text", "Text"),
        ("code", "Code"),
    )

    document = models.ForeignKey(
        Document, related_name="blocks", on_delete=models.CASCADE
    )
    block_type = models.CharField(max_length=10, choices=BLOCK_TYPES)
    content = models.TextField()
    language = models.CharField(max_length=50, blank=True, default="")
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.document.title} - {self.block_type} #{self.order}"


class Like(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    document = models.ForeignKey(
        Document, related_name="likes", on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "document")

    def __str__(self):
        return f"{self.user.username} likes {self.document.title}"
