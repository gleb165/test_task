from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/comments/$", consumers.CommentListConsumer.as_asgi()),
    re_path(r"ws/comments/(?P<comment_id>[0-9a-f\-]+)/$", consumers.CommentThreadConsumer.as_asgi()),
]
