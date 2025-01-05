from django.urls import path
from . import views

urlpatterns = [
    path('detect/', views.EmotionDetectionView.as_view(), name='emotion-detect'),
] 