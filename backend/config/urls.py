from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/auth/", include("apps.api_auth.api.urls")),
    path("api/dashboard/", include("apps.dashboard.api.urls")),
    path("api/clientes/", include("apps.clientes.api.urls")),
    path("api/pedidos/", include("apps.pedidos.api.urls")),
    path("api/inventario/", include("apps.inventario.api.urls")),
    path("api/catalogo/", include("apps.catalogo.api.urls")),
]