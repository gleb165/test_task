import boto3
from django.conf import settings
from django.db.models.signals import post_delete
from django.dispatch import receiver
from core.comment.models import CommentAttachment


@receiver(post_delete, sender=CommentAttachment)
def delete_comment_attachment_file_from_s3(sender, instance, **kwargs):
    """
    Удаляет файл вложения комментария из AWS S3 после удаления юзера.
    """
    if instance.file:
        s3 = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
        )

        bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        file_path = instance.file.name   # comment_attachments/2025/11/...

        try:
            s3.delete_object(Bucket=bucket_name, Key=file_path)
            print(f"Deleted comment attachment from S3: {file_path}")
        except Exception as e:
            print(f"Error deleting attachment file from S3: {e}")