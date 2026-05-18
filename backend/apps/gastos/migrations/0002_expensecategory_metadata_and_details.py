from django.db import migrations, models


CATEGORY_DEFINITIONS = [
    {
        "code": "GALLERY",
        "name": "Gallería",
        "aliases": ["Gallería"],
        "form_group": "MISCELANEO",
        "sort_order": 70,
    },
    {
        "code": "TRAVEL_EXPENSES",
        "name": "Gastos de viajes",
        "aliases": ["gastos de viajes colombia/miami", "Gastos de viajes"],
        "form_group": "VIAJES",
        "sort_order": 10,
    },
    {
        "code": "CUBOX_STORAGE",
        "name": "Bodegas cubox",
        "aliases": ["Bodegas cubox"],
        "form_group": "LOGISTICA",
        "sort_order": 20,
    },
    {
        "code": "DHL",
        "name": "DHL",
        "aliases": ["DHL"],
        "form_group": "LOGISTICA",
        "sort_order": 21,
    },
    {
        "code": "DELIVERY_RUNS",
        "name": "ENVIOS - CARRERAS",
        "aliases": ["ENVIOS - CARRERAS"],
        "form_group": "LOGISTICA",
        "sort_order": 22,
    },
    {
        "code": "EMPLOYEE_PAYMENTS",
        "name": "PAGO DE EMPLEADOS",
        "aliases": ["PAGO DE EMPLEADO -", "PAGO DE EMPLEADOS"],
        "form_group": "PERSONAL",
        "sort_order": 30,
    },
    {
        "code": "SPUR_PAINTING",
        "name": "PAGO DE PINTADA DE ESPUELAS",
        "aliases": ["PAGO DE PINTADA DE ESPUELAS"],
        "form_group": "PRODUCCION",
        "sort_order": 40,
    },
    {
        "code": "SUPPLIES",
        "name": "INSUMOS",
        "aliases": ["INSUMOS"],
        "form_group": "PRODUCCION",
        "sort_order": 41,
    },
    {
        "code": "PRODUCTION_MOLDS",
        "name": "MOLDES PARA PRODUCCIÓN",
        "aliases": ["MOLDES PARA PRODUCCIÓN"],
        "form_group": "PRODUCCION",
        "sort_order": 42,
    },
    {
        "code": "VAT_DECLARATIONS",
        "name": "Declaraciones de IVA",
        "aliases": ["DECLARACIONES IVA DE RAUL", "Declaraciones de IVA"],
        "form_group": "FISCAL",
        "sort_order": 50,
    },
    {
        "code": "PROVIDED_SERVICES",
        "name": "Servicios prestados",
        "aliases": ["SERVICIOS PRESTADOS (CONTADORA)", "Servicios prestados"],
        "form_group": "SERVICIOS",
        "sort_order": 60,
    },
    {
        "code": "MISCELLANEOUS",
        "name": "MISCELANEO",
        "aliases": ["MISCELANEO"],
        "form_group": "MISCELANEO",
        "sort_order": 71,
    },
]


def sync_fixed_expense_categories(apps, schema_editor):
    ExpenseCategory = apps.get_model("gastos", "ExpenseCategory")

    for definition in CATEGORY_DEFINITIONS:
        category = ExpenseCategory.objects.filter(code=definition["code"]).first()

        if category is None:
            aliases = definition["aliases"]
            for alias in aliases:
                category = ExpenseCategory.objects.filter(name__iexact=alias).first()
                if category is not None:
                    break

        if category is None:
            category = ExpenseCategory.objects.create(
                name=definition["name"],
                description="",
                code=definition["code"],
                form_group=definition["form_group"],
                sort_order=definition["sort_order"],
                is_system=True,
            )
            continue

        category.name = definition["name"]
        category.code = definition["code"]
        category.form_group = definition["form_group"]
        category.sort_order = definition["sort_order"]
        category.is_system = True
        category.save(
            update_fields=["name", "code", "form_group", "sort_order", "is_system", "updated_at"]
        )


class Migration(migrations.Migration):

    dependencies = [
        ("gastos", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="expense",
            name="details",
            field=models.JSONField(blank=True, default=dict, verbose_name="Detalles"),
        ),
        migrations.AddField(
            model_name="expensecategory",
            name="code",
            field=models.CharField(blank=True, db_index=True, max_length=64, null=True, unique=True, verbose_name="Codigo"),
        ),
        migrations.AddField(
            model_name="expensecategory",
            name="form_group",
            field=models.CharField(
                blank=True,
                choices=[
                    ("VIAJES", "Viajes"),
                    ("LOGISTICA", "Logistica"),
                    ("PERSONAL", "Personal"),
                    ("PRODUCCION", "Produccion"),
                    ("FISCAL", "Fiscal"),
                    ("SERVICIOS", "Servicios"),
                    ("MISCELANEO", "Miscelaneo"),
                ],
                db_index=True,
                max_length=32,
                null=True,
                verbose_name="Grupo de formulario",
            ),
        ),
        migrations.AddField(
            model_name="expensecategory",
            name="is_system",
            field=models.BooleanField(default=False, verbose_name="Categoria de sistema"),
        ),
        migrations.AddField(
            model_name="expensecategory",
            name="sort_order",
            field=models.PositiveSmallIntegerField(default=0, verbose_name="Orden"),
        ),
        migrations.AlterModelOptions(
            name="expensecategory",
            options={"ordering": ["sort_order", "name"], "verbose_name": "Categoria de gasto", "verbose_name_plural": "Categorias de gasto"},
        ),
        migrations.RunPython(sync_fixed_expense_categories, migrations.RunPython.noop),
    ]
