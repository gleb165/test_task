from rest_framework_nested import routers
from core.comment.viewsets import CommentViewSet

router = routers.SimpleRouter()
router.register(r'', CommentViewSet, basename='comment')

urlpatterns = router.urls
