from django_redis import get_redis_connection
from core.comment.models import Comment

redis = get_redis_connection("default")


class CommentLikesCache:

    @staticmethod
    def like(comment_id, user_id):
        user_id_str = str(user_id)
        key = f"comment:{comment_id}:likes"
        count_key = f"comment:{comment_id}:likes_count"
        # Only add and increment if not already liked
        if not redis.sismember(key, user_id_str):
            redis.sadd(key, user_id_str)
            redis.incr(count_key)

    @staticmethod
    def unlike(comment_id, user_id):
        user_id_str = str(user_id)
        key = f"comment:{comment_id}:likes"
        count_key = f"comment:{comment_id}:likes_count"
        # Only remove and decrement if user has liked
        if redis.sismember(key, user_id_str):
            redis.srem(key, user_id_str)
            redis.decr(count_key)

    @staticmethod
    def has_liked(comment_id, user_id):
        user_id_str = str(user_id)
        return bool(redis.sismember(f"comment:{comment_id}:likes", user_id_str))

    @staticmethod
    def likes_count(comment_id):
        count = redis.get(f"comment:{comment_id}:likes_count")
        if count is None:
            # загрузка в кеш из БД при первом запросе
            real_count = Comment.objects.get(id=comment_id).liked_by.count()
            redis.set(f"comment:{comment_id}:likes_count", real_count)
            return real_count
        return int(count)

    @staticmethod
    def warmup(comment_id):
        # Инициализация SET лайков из БД
        comment = Comment.objects.get(id=comment_id)
        user_ids = comment.liked_by.values_list("id", flat=True)
        key = f"comment:{comment_id}:likes"

        redis.delete(key)
        if user_ids:
            redis.sadd(key, *user_ids)
