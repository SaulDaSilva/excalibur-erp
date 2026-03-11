from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from apps.api_auth.api.serializers import LoginSerializer, MeSerializer
from apps.api_auth.throttles import LoginRateThrottle


@api_view(["GET"])
@permission_classes([AllowAny])
def csrf(request):
    # ensures csrftoken cookie is set/rotated
    token = get_token(request)
    return Response({"csrfToken": token})


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def login_view(request):
    ser = LoginSerializer(data=request.data)
    ser.is_valid(raise_exception=True)

    user = authenticate(
        request,
        username=ser.validated_data["username"],
        password=ser.validated_data["password"],
    )
    if user is None:
        return Response({"detail": "Credenciales inválidas."}, status=status.HTTP_400_BAD_REQUEST)

    login(request, user)
    return Response(MeSerializer(user).data)


@api_view(["GET"])
def me(request):
    return Response(MeSerializer(request.user).data)


@api_view(["POST"])
def logout_view(request):
    logout(request)
    return Response({"detail": "OK"})
