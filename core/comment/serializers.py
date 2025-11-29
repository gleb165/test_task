from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from core.abstract.serializers import AbstractSerializers
from core.user.models import User
from core.user.serializers import UserSerializer
from core.comment.models import Comment, CommentAttachment
import bleach
from django.conf import settings
from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile

# Разрешенные HTML теги для поля Text
ALLOWED_TAGS = ['a', 'code', 'i', 'strong']
ALLOWED_ATTRIBUTES = {
    'a': ['href', 'title']
}


class CommentAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentAttachment
        fields = ['id', 'file', 'attachment_type']

class CommentSerializer(AbstractSerializers):
    author = serializers.HiddenField(
        default=serializers.CurrentUserDefault() 
    )
    
    parent = serializers.SlugRelatedField(
        slug_field='public_id',  
        queryset=Comment.objects.all(),
        required=False,
        allow_null=True
    )
    
    # Поля для незарегистрированных пользователей
    guest_name = serializers.CharField(max_length=100, required=False, allow_null=True)
    guest_email = serializers.EmailField(required=False, allow_null=True)
    
    # фронтенд френдли вывовод
    author_name = serializers.CharField(read_only=True)
    author_email = serializers.EmailField(read_only=True)
    
    liked = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    
    attachments = CommentAttachmentSerializer(many=True, read_only=True)

    
    def get_likes_count(self, instance):
        return instance.liked_by.count()
    
    def get_liked(self, instance):
        request = self.context.get('request', None)
        if request is None or request.user.is_anonymous:
            return False
        return request.user.has_liked(instance)

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        if isinstance(instance.author, User):
            representation['author'] = UserSerializer(instance.author).data
        else: 
            author_obj = User.objects.get_object_by_public_id(instance.author.public_id)
            representation['author'] = UserSerializer(author_obj).data
        
        return representation
    
    
    def validate(self, data):
        user = self.context['request'].user
        is_authenticated = user and user.is_authenticated
        
        
        if not is_authenticated:
            if not data.get('guest_name'):
                raise ValidationError("User Name is required for guest comments.")
            if not data.get('guest_email'):
                raise ValidationError("E-mail is required for guest comments.")
            

        text = data.get('text')
        if text:
            cleaned_text = bleach.clean(
                text, 
                tags=ALLOWED_TAGS, 
                attributes=ALLOWED_ATTRIBUTES, 
                strip=True
            )
            data['text'] = cleaned_text
        
        return data
    
    # Создание Объекта
    def create(self, validated_data):
        request = self.context['request']
        request_files = request.FILES.getlist('files')
        
        
        if request.user and request.user.is_authenticated:
            validated_data['author'] = request.user
            validated_data['guest_name'] = None 
            validated_data['guest_email'] = None 
        else:
            validated_data.pop('author', None)

        
        comment = Comment.objects.create(**validated_data)

        for uploaded_file in request_files:
            file_type = 'image' if uploaded_file.content_type.startswith('image/') else 'text'
            
            if file_type == 'image':
                if uploaded_file.size > 10 * 1024 * 1024: 
                    raise ValidationError("Image file is too large.")

                if uploaded_file.content_type not in ['image/jpeg', 'image/gif', 'image/png']:
                    raise ValidationError("Image must be in JPG, GIF, or PNG format.")

                try:
                    img = Image.open(uploaded_file)
                    original_format = img.format
                except Exception:
                    raise ValidationError("Invalid image file.")
                
                max_width, max_height = 320, 240
                if img.width > max_width or img.height > max_height:
                    img.thumbnail((max_width, max_height), Image.LANCZOS)
                
                output = BytesIO()
                if original_format in ['JPEG', 'JPG']:
                    img.save(output, format='JPEG')
                elif original_format == 'PNG':
                    img.save(output, format='PNG')
                elif original_format == 'GIF':
                    img.save(output, format='GIF')
                
                output.seek(0)
                
                uploaded_file = InMemoryUploadedFile(
                    output, 
                    'FileField', 
                    uploaded_file.name, 
                    uploaded_file.content_type, 
                    output.tell(), 
                    None
                )
            
            elif file_type == 'text':
                if not uploaded_file.name.lower().endswith('.txt'):
                    raise ValidationError("Text file must be in TXT format.")
                if uploaded_file.size > 100 * 1024:
                    raise ValidationError("Text file is too large (max 100kb).")
            
            CommentAttachment.objects.create(
                comment=comment, 
                file=uploaded_file,
                attachment_type=file_type
            )

        return comment



    
    def update(self, instance, validated_data):
        if not instance.edited:
            validated_data['edited'] = True
        instance =  super().update(instance, validated_data)
        return instance
        
    class Meta:
        model = Comment
        fields = ['id', 'author', 'guest_name', 'guest_email', 'parent', 'author_name', 'author_email', 'liked', 'likes_count', 'text', 'attachments', 'edited', 'created', 'updated']
        read_only_fields = ['edited']