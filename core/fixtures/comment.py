import pytest
from core.fixtures.user import user_fixture
from core.comment.models import Comment

@pytest.fixture
def comment_fixture(user_fixture):
    return Comment.objects.create(
        author=user_fixture,
        text="Test comment."
    )
    