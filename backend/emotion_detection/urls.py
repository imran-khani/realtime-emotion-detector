from django.urls import path
from .views import EmotionDetectionView

urlpatterns = [
    path('detect/', EmotionDetectionView.as_view(), name='emotion-detect'),
] 