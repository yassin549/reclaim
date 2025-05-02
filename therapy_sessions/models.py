from django.db import models
from django.utils import timezone


class Session(models.Model):
    user_id = models.CharField(max_length=255)  # We'll use this until we implement auth
    title = models.CharField(max_length=255, blank=True)  # e.g. "Sad Morning", "Panic Attack"
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    summary = models.TextField(blank=True)  # AI-generated summary
    mood_score = models.IntegerField(null=True, blank=True)  # 1-10 scale

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title or 'Untitled'} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class Message(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
    ]

    session = models.ForeignKey(Session, related_name='messages', on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."
