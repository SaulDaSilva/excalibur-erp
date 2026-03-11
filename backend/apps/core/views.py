from django.conf import settings
from django.http import Http404, HttpResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.cache import never_cache


@method_decorator(never_cache, name="dispatch")
class FrontendAppView(View):
    def get(self, request, *args, **kwargs):
        if not settings.SERVE_FRONTEND:
            raise Http404("Frontend serving is disabled.")

        index_path = settings.FRONTEND_DIST_DIR / "index.html"
        if not index_path.exists():
            return HttpResponse(
                "Frontend build not found.",
                status=503,
                content_type="text/plain; charset=utf-8",
            )

        return HttpResponse(
            index_path.read_text(encoding="utf-8"),
            content_type="text/html; charset=utf-8",
        )
