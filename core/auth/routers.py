from rest_framework_nested import routers
from core.auth.viewsets.register import RegisterViewSet
from core.auth.viewsets.login import LoginViewSet
from core.auth.viewsets.refresh import RefreshViewSet

router = routers.SimpleRouter()
router.register(r'register', RegisterViewSet, basename='auth-register')
router.register(r'login', LoginViewSet, basename='auth-login')
router.register(r'refresh', RefreshViewSet, basename='auth-refresh')

urlpatterns = router.urls
