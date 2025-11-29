from rest_framework_nested import routers
from core.user.viewsets import UserViewSet

router = routers.SimpleRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = router.urls
