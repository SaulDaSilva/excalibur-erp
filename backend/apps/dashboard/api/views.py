from rest_framework.response import Response
from rest_framework.views import APIView

from apps.dashboard import services
from apps.dashboard.api.serializers import (
    DashboardSummaryQuerySerializer,
    DashboardSummarySerializer,
)


class DashboardSummaryAPIView(APIView):
    def get(self, request):
        query_serializer = DashboardSummaryQuerySerializer(data=request.query_params)
        query_serializer.is_valid(raise_exception=True)

        low_stock_threshold = query_serializer.validated_data["low_stock_threshold"]
        summary = services.get_dashboard_summary(low_stock_threshold=low_stock_threshold)
        serializer = DashboardSummarySerializer(summary)
        return Response(serializer.data)
