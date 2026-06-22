"""Authentication views."""

from drf_spectacular.utils import OpenApiExample, extend_schema
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView as SimpleJWTTokenRefreshView

from apps.accounts.serializers import (
    CustomTokenObtainPairSerializer,
    LogoutSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    UserRegistrationSerializer,
)


@extend_schema(
    tags=["Authentication"],
    request=UserRegistrationSerializer,
    responses={201: UserProfileSerializer},
    examples=[
        OpenApiExample(
            "Register Employee",
            value={
                "email": "john.doe@company.com",
                "password": "SecurePass123!",
                "password_confirm": "SecurePass123!",
                "first_name": "John",
                "last_name": "Doe",
                "phone_number": "+1234567890",
                "department": "Engineering",
                "employee_id": "EMP001",
            },
            request_only=True,
        ),
    ],
)
class RegisterView(generics.CreateAPIView):
    """Register a new employee account."""

    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            UserProfileSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["Authentication"])
class LoginView(TokenObtainPairView):
    """Obtain JWT access and refresh tokens."""

    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


@extend_schema(tags=["Authentication"])
class TokenRefreshView(SimpleJWTTokenRefreshView):
    """Refresh an expired access token."""

    permission_classes = [AllowAny]


@extend_schema(
    tags=["Authentication"],
    request=LogoutSerializer,
    responses={205: None},
)
class LogoutView(APIView):
    """Blacklist the refresh token to log out."""

    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            token = RefreshToken(serializer.validated_data["refresh"])
            token.blacklist()
        except Exception:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_205_RESET_CONTENT)


class ProfileView(generics.RetrieveUpdateAPIView):
    """Retrieve or update the authenticated user's profile."""

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UserProfileUpdateSerializer
        return UserProfileSerializer

    def get_object(self):
        return self.request.user

    @extend_schema(tags=["Profile"], responses={200: UserProfileSerializer})
    def get(self, request: Request, *args, **kwargs) -> Response:
        return super().get(request, *args, **kwargs)

    @extend_schema(tags=["Profile"], request=UserProfileUpdateSerializer)
    def patch(self, request: Request, *args, **kwargs) -> Response:
        response = super().patch(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            from apps.audits.services import audit_employee_updated

            audit_employee_updated(employee=self.get_object(), admin=None)
            return Response(
                UserProfileSerializer(self.get_object()).data,
                status=status.HTTP_200_OK,
            )
        return response

    @extend_schema(tags=["Profile"], request=UserProfileUpdateSerializer)
    def put(self, request: Request, *args, **kwargs) -> Response:
        response = super().put(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            from apps.audits.services import audit_employee_updated

            audit_employee_updated(employee=self.get_object(), admin=None)
            return Response(
                UserProfileSerializer(self.get_object()).data,
                status=status.HTTP_200_OK,
            )
        return response
