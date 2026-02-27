"""MinIO object storage service for ticket screenshots."""

from minio import Minio
from minio.error import S3Error
from app.config import settings
from datetime import timedelta
import uuid
import io
import logging

logger = logging.getLogger(__name__)


class StorageService:
    """MinIO object storage service for ticket screenshots."""

    ALLOWED_TYPES = {"image/png", "image/jpeg", "image/gif", "image/webp"}
    MAX_SIZE = 2 * 1024 * 1024  # 2MB

    def __init__(self):
        self.client = Minio(
            settings.minio_endpoint,
            access_key=settings.minio_access_key,
            secret_key=settings.minio_secret_key,
            secure=settings.minio_secure
        )
        self._ensure_bucket()

    def _ensure_bucket(self):
        """Create bucket if not exists."""
        try:
            if not self.client.bucket_exists(settings.minio_bucket):
                self.client.make_bucket(settings.minio_bucket)
                logger.info(f"Created MinIO bucket: {settings.minio_bucket}")
        except S3Error as e:
            logger.warning(f"Could not ensure bucket exists: {e}")

    def upload_image(self, file_data: bytes, filename: str, content_type: str) -> dict:
        """Upload image and return storage info.

        Args:
            file_data: Raw file bytes
            filename: Original filename
            content_type: MIME type

        Returns:
            dict with id, filename, storedName, mimeType, size

        Raises:
            ValueError: If file type or size is invalid
        """
        # Validate content type
        if content_type not in self.ALLOWED_TYPES:
            raise ValueError(f"Invalid file type: {content_type}. Allowed types: {', '.join(self.ALLOWED_TYPES)}")

        # Validate file size
        if len(file_data) > self.MAX_SIZE:
            raise ValueError(f"File too large: {len(file_data)} bytes. Maximum allowed: {self.MAX_SIZE} bytes")

        # Generate unique storage name
        ext = filename.rsplit(".", 1)[-1] if "." in filename else "png"
        stored_name = f"{uuid.uuid4()}.{ext}"

        # Upload to MinIO
        self.client.put_object(
            settings.minio_bucket,
            stored_name,
            io.BytesIO(file_data),
            length=len(file_data),
            content_type=content_type
        )

        logger.info(f"Uploaded image: {stored_name} ({len(file_data)} bytes)")

        return {
            "id": str(uuid.uuid4()),
            "filename": filename,
            "storedName": stored_name,
            "mimeType": content_type,
            "size": len(file_data)
        }

    def get_presigned_url(self, stored_name: str) -> str:
        """Generate presigned URL for image access.

        Args:
            stored_name: MinIO object key

        Returns:
            Presigned URL valid for minio_url_expiry seconds
        """
        return self.client.presigned_get_object(
            settings.minio_bucket,
            stored_name,
            expires=timedelta(seconds=settings.minio_url_expiry)
        )

    def delete_image(self, stored_name: str) -> bool:
        """Delete image from storage.

        Args:
            stored_name: MinIO object key

        Returns:
            True if deletion succeeded, False otherwise
        """
        try:
            self.client.remove_object(settings.minio_bucket, stored_name)
            logger.info(f"Deleted image: {stored_name}")
            return True
        except S3Error as e:
            logger.error(f"Failed to delete image {stored_name}: {e}")
            return False


# Singleton instance
storage_service = StorageService()
