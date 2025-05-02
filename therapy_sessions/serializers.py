from rest_framework import serializers
from .models import Session, Message


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'role', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']


class SessionSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Session
        fields = ['id', 'user_id', 'title', 'created_at', 'updated_at', 'summary', 'mood_score', 'messages']
        read_only_fields = ['id', 'created_at', 'updated_at']
