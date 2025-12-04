from rest_framework.response import Response
from rest_framework import status
from django.http.response  import Http404
from core.abstract.viewsets import AbstractViewSet
from core.comment.models import Comment
from core.comment.serializers import CommentSerializer
from core.auth.viewsets.permissions  import UserPermission
from rest_framework.decorators import action
from django.db.models import Case, When, Value, CharField, F
from rest_framework.permissions import AllowAny


class CommentViewSet(AbstractViewSet):
    queryset = Comment.objects.all()
    http_method_names = ['get', 'post', 'put', 'delete']
    serializer_class = CommentSerializer
    permission_classes = (UserPermission,)
    filter_backends = [] 
    ordering = None
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        user = self.request.user

        if not user.is_authenticated or not user.is_superuser:
            queryset = queryset.filter(active=True, parent__isnull=True)
            
        # Аннотация для sortable_name
        queryset = queryset.annotate(
            sortable_name=Case(
                When(guest_name__isnull=False, then=F('guest_name')),
                default=F('author__username'), 
                output_field=CharField(),
            )
        )
        
        # Аннотация для sortable_email
        queryset = queryset.annotate(
            sortable_email=Case(
                When(guest_email__isnull=False, then=F('guest_email')),
                default=F('author__email'),
                output_field=CharField(),
            )
        )
        
        sort_by = self.request.query_params.get('sort_by')
        order = self.request.query_params.get('order', 'desc')
        
        sort_field = None
        
        if sort_by == 'username':
            sort_field = 'sortable_name' if order == 'asc' else '-sortable_name'
        elif sort_by == 'email':
            sort_field = 'sortable_email' if order == 'asc' else '-sortable_email'
        elif sort_by == 'created':
            sort_field = 'created' if order == 'asc' else '-created'
            
        if sort_field:
            queryset = queryset.order_by(sort_field)

        return queryset

    
    
    def get_object(self):
        obj = Comment.objects.get_object_by_public_id(self.kwargs['pk'])
        self.check_object_permissions(self.request, obj)
        return obj
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
    
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    
    @action(detail=True, methods=['get', 'post'], permission_classes=[AllowAny])
    def replies(self, request, pk=None):
        comment = self.get_object()

        if request.method == 'GET':
            replies = comment.replies.all() 
            serializer = self.get_serializer(replies, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            data = request.data.copy()
            data['parent'] = comment.public_id 
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                reply = serializer.save() 
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
    
    @action(detail=True, methods=['post'])
    def like(self, request,pk=None):
        comment = self.get_object()
        user = request.user
        user.like(comment)
        serializer = self.serializer_class(comment, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


    @action(detail=True, methods=['post'])
    def unlike(self, request,pk=None):
        comment = self.get_object()
        user = request.user
        user.unlike(comment)
        serializer = self.serializer_class(comment, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)