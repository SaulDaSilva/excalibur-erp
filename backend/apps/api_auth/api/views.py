from django.contrib.auth import login, logout
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.api_auth.api.serializers import LoginSerializer, MeSerializer
from apps.api_auth.services import LoginError, attempt_login


@api_view(["GET"])
@permission_classes([AllowAny])
def csrf(request):
    # ensures csrftoken cookie is set/rotated
    token = get_token(request)
    return Response({"csrfToken": token})


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    ser = LoginSerializer(data=request.data)
    ser.is_valid(raise_exception=True)

    try:
        user = attempt_login(
            request,
            username=ser.validated_data["username"],
            password=ser.validated_data["password"],
        )
    except LoginError as exc:
        return Response({"detail": exc.detail}, status=exc.status_code)

    login(request, user)
    return Response(MeSerializer(user).data)


@api_view(["GET"])
def me(request):
    return Response(MeSerializer(request.user).data)


@api_view(["POST"])
def logout_view(request):
    logout(request)
    return Response({"detail": "OK"})
