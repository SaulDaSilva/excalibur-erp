from django.db import migrations, models
from django.utils import timezone


def backfill_order_date(apps, schema_editor):
    Order = apps.get_model("pedidos", "Order")
    for order in Order.objects.filter(order_date__isnull=True).only("id", "created_at").iterator():
        created_at = order.created_at
        if timezone.is_aware(created_at):
            created_at = timezone.localtime(created_at)
        order.order_date = created_at.date()
        order.save(update_fields=["order_date"])


class Migration(migrations.Migration):

    dependencies = [
        ("pedidos", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="order_date",
            field=models.DateField(null=True, verbose_name="Fecha del pedido"),
        ),
        migrations.RunPython(backfill_order_date, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="order",
            name="order_date",
            field=models.DateField(default=timezone.localdate, verbose_name="Fecha del pedido"),
        ),
        migrations.AlterModelOptions(
            name="order",
            options={
                "ordering": ["-order_date", "-created_at"],
                "verbose_name": "Pedido",
                "verbose_name_plural": "Pedidos",
            },
        ),
        migrations.AddIndex(
            model_name="order",
            index=models.Index(fields=["status", "order_date"], name="ped_ord_status_odate_idx"),
        ),
        migrations.AddIndex(
            model_name="order",
            index=models.Index(fields=["customer", "order_date"], name="ped_ord_customer_odate_idx"),
        ),
    ]
