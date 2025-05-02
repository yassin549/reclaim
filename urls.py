"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def api_root(request):
    return Response({
        'message': 'Welcome to the Reclaim API',
        'version': '1.0',
        'endpoints': {
            'admin': '/admin/',
            'therapy_sessions': '/api/sessions/'
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('therapy_sessions.urls')),
    path('', api_root, name='api-root'),  # Root URL shows API info
]
