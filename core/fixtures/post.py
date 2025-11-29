# import pytest
# from core.post.models import Post
# from core.fixtures.user import user_fixture

# @pytest.fixture
# def post_fixture(user_fixture, db):
#     post = Post.objects.create(
#         author=user_fixture,
#         body="This is a fixture post."
#     )
#     return post