from django.db import models
from core.abstract.models import AbstractModel, AbstractModelManager
# Create your models here.
class CommentManager(AbstractModelManager):
    def get_root_comments(self):
        """Возвращает только корневые комментарии"""
        return self.filter(parent__isnull=True)

class Comment(AbstractModel):
    
    author = models.ForeignKey("core_user.User", on_delete=models.CASCADE, blank=True, null=True)
    guest_name = models.CharField(max_length=100, blank=True, null=True)
    guest_email = models.EmailField(blank=True, null=True)
    homepage = models.URLField(blank=True, null=True)
    # отношения с самим собой чтобы реализовать (каскадное отображение)
    parent = models.ForeignKey('self', null=True, blank=True, related_name='replies', on_delete=models.CASCADE)
    text = models.TextField()
    
    edited = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    
    
    objects = CommentManager()
    
    
    class Meta:
        ordering = ['-created']  # LIFO default
        
    def __str__(self):
        if self.author:
            return self.author.username
        return self.guest_name or "Anonymous"
    
    @property
    def author_name(self):
        return self.guest_name if self.guest_name else self.author.username

    @property
    def author_email(self):
        return self.guest_email if self.guest_email else self.author.email


class CommentAttachment(models.Model):
    
    ATTACHMENT_CHOICES = (
        ('image', 'Image'),
        ('text', 'Text File'),
    )
    
    comment = models.ForeignKey(
        Comment,
        related_name='attachments',
        on_delete=models.CASCADE
    )


    file = models.FileField(upload_to='comment_attachments/%Y/%m/%d/')
    attachment_type = models.CharField(max_length=5, choices=ATTACHMENT_CHOICES, default='image')

    def __str__(self):
        return f"{self.attachment_type} for {self.comment.author_name}"