from rest_framework.permissions import BasePermission, SAFE_METHODS

class UserPermission(BasePermission):
    """
    Custom permission to only allow users to access their own data.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_anonymous:
            return request.method in SAFE_METHODS
        
        if view.basename in ['comment']:
            if request.method in ["DELETE"]:
                return bool(request.user.is_superuser or request.user == obj.author)
            return bool(request.user and request.user.is_authenticated)
        return False

    def has_permission(self, request, view):
        if view.basename in ['comment']:
            if request.user.is_anonymous:
                return request.method in SAFE_METHODS or request.method == 'POST'
            return bool(request.user and request.user.is_authenticated)
        return False
            

        