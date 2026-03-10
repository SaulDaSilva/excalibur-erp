from django.db import models
from django.utils import timezone


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        abstract = True


class SoftDeleteQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_active=True)

    def inactive(self):
        return self.filter(is_active=False)


class SoftDeleteModel(models.Model):
    is_active = models.BooleanField(default=True)
    deleted_at = models.DateTimeField(null=True, blank=True,editable=False)

    objects = SoftDeleteQuerySet.as_manager()

    class Meta:
        abstract = True

    def soft_delete(self):
        if self.is_active:
            self.is_active = False
            self.deleted_at = timezone.now()
            self.save(update_fields=["is_active", "deleted_at"])

    def restore(self):
        if not self.is_active:
            self.is_active = True
            self.deleted_at = None
            self.save(update_fields=["is_active", "deleted_at"])