import requests
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.conf import settings
from .models import Session, Message
from .serializers import SessionSerializer, MessageSerializer


class SessionViewSet(viewsets.ModelViewSet):
    serializer_class = SessionSerializer
    
    def get_queryset(self):
        user_id = self.request.query_params.get('user_id', '')
        return Session.objects.filter(user_id=user_id)
    
    @action(detail=True, methods=['post'])
    def message(self, request, pk=None):
        """Add a message to a session and get AI response"""
        session = self.get_object()
        message_content = request.data.get('message', '').strip()
        
        if not message_content:
            return Response(
                {'error': 'Message content is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save user message
        user_message = Message.objects.create(
            session=session,
            role='user',
            content=message_content
        )
        
        try:
            # Get recent chat history for context
            recent_messages = session.messages.order_by('-created_at')[:6][::-1]
            chat_history = '\n'.join(
                [f"{'User' if msg.role == 'user' else 'Assistant'}: {msg.content}" 
                 for msg in recent_messages]
            )
            
            # Format the prompt
            prompt = f"""You are a compassionate and professional AI therapist. Your responses should be empathetic, 
insightful, and focused on understanding and supporting the client's emotional well-being. 
Keep responses concise but meaningful.

Previous conversation history:
{chat_history}

user
{message_content}

assistant
"""
            
            # Call Hugging Face API
            headers_hf = {
                'Authorization': f'Bearer {settings.HF_TOKEN}',
                'Content-Type': 'application/json'
            }
            
            hf_payload = {
                'inputs': prompt,
                'parameters': {
                    'max_length': 150,
                    'temperature': 0.7,
                    'top_p': 0.9,
                    'do_sample': True
                }
            }
            
            # Get AI response
            hf_resp = requests.post(
                'https://api-inference.huggingface.co/models/Open-Orca/Mistral-7B-OpenOrca',
                headers=headers_hf,
                json=hf_payload,
                timeout=30
            )
            hf_resp.raise_for_status()
            ai_response = hf_resp.json()[0]['generated_text']
            
            # Save AI response
            ai_message = Message.objects.create(
                session=session,
                role='assistant',
                content=ai_response
            )
            
            # Update session
            if not session.title and len(session.messages.all()) <= 3:
                # Generate a title for new sessions based on first messages
                session.title = f"Session about {message_content[:30]}..."
                session.save()
            
            return Response({
                'user_message': MessageSerializer(user_message).data,
                'ai_message': MessageSerializer(ai_message).data
            })
            
        except requests.exceptions.RequestException as e:
            # Fallback response in case of API errors
            ai_response = "I apologize, but I'm having trouble processing your request right now. Please try again in a moment."
            ai_message = Message.objects.create(
                session=session,
                role='assistant',
                content=ai_response
            )
            return Response({
                'user_message': MessageSerializer(user_message).data,
                'ai_message': MessageSerializer(ai_message).data,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def summary(self, request, pk=None):
        """Generate a summary for the session"""
        session = self.get_object()
        
        try:
            # Get all messages from the session
            messages = session.messages.all()
            chat_history = '\n'.join(
                [f"{'User' if msg.role == 'user' else 'Assistant'}: {msg.content}" 
                 for msg in messages]
            )
            
            # Format the prompt for summary generation
            prompt = f"""You are a professional therapist. Please provide a brief summary of the following therapy session.
Focus on key themes, insights, and any action items or suggestions discussed.

Session transcript:
{chat_history}

Please provide a concise summary:

assistant
"""
            
            # Call Hugging Face API
            headers_hf = {
                'Authorization': f'Bearer {settings.HF_TOKEN}',
                'Content-Type': 'application/json'
            }
            
            hf_payload = {
                'inputs': prompt,
                'parameters': {
                    'max_length': 200,
                    'temperature': 0.7,
                    'top_p': 0.9,
                    'do_sample': True
                }
            }
            
            # Get AI summary
            hf_resp = requests.post(
                'https://api-inference.huggingface.co/models/Open-Orca/Mistral-7B-OpenOrca',
                headers=headers_hf,
                json=hf_payload,
                timeout=30
            )
            hf_resp.raise_for_status()
            summary = hf_resp.json()[0]['generated_text']
            
            # Update session with summary
            session.summary = summary
            session.save()
            
            return Response({'summary': summary})
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
