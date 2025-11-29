from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from core.abstract.models import AbstractModel, AbstractModelManager

# Create your models here.




class UserManager(BaseUserManager, AbstractModelManager):

    def create_user(self, username, email, first_name=None, last_name=None, password=None, **kwargs):
        if username is None:
            raise TypeError('Users must have a username.')
        if email is None:
            raise TypeError('Users must have an email address.')
        if password is None:
            raise TypeError('Users must have a password.')
        user = self.model(username=username, email=self.normalize_email(email), first_name=first_name, last_name=last_name)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    """create superuser method"""
    def create_superuser(self, username, email, first_name=None, last_name=None, password=None, **kwargs):
        if username is None:
            raise TypeError('Users must have a username.')
        if email is None:
            raise TypeError('Users must have an email address.')
        if password is None:
            raise TypeError('Users must have a password.')
        user = self.model(username=username, email=self.normalize_email(email), first_name=first_name, last_name=last_name)
        user.is_superuser = True
        user.is_staff = True
        user.set_password(password)
        user.save(using=self._db)
        return user
    



class User(AbstractModel, AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=250, unique=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True, null=True)
    last_name = models.CharField(max_length=30, blank=True, null=True)
    is_active = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    comments_liked = models.ManyToManyField('core_comment.Comment', related_name='liked_by', blank=True)

    
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return self.email
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def like(self, comment):
        return self.comments_liked.add(comment)
    
    def unlike(self, comment):
        return self.comments_liked.remove(comment)

    def has_liked(self, comment):
        return self.comments_liked.filter(pk=comment.pk).exists()
    