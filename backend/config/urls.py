from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path

from apps.core.views import FrontendAppView

urlpatterns = [
    path("api/auth/", include("apps.api_auth.api.urls")),
    path("api/dashboard/", include("apps.dashboard.api.urls")),
    path("api/clientes/", include("apps.clientes.api.urls")),
    path("api/pedidos/", include("apps.pedidos.api.urls")),
    path("api/inventario/", include("apps.inventario.api.urls")),
    path("api/catalogo/", include("apps.catalogo.api.urls")),
    path("api/gastos/", include("apps.gastos.api.urls")),
]

if settings.ENABLE_ADMIN:
    urlpatterns.insert(0, path(settings.ADMIN_URL_PATH, admin.site.urls))

if settings.SERVE_FRONTEND:
    urlpatterns.append(
        re_path(r"^(?!api/|static/).*$", FrontendAppView.as_view(), name="frontend-app")
    )
