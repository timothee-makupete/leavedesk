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
    RegistrationResponseSerializer,
    ResendVerificationSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    UserRegistrationSerializer,
    VerifyEmailSerializer,
)
from apps.accounts.verification import create_and_send_verification_code, verify_email_code


@extend_schema(
    tags=["Authentication"],
    request=UserRegistrationSerializer,
    responses={201: RegistrationResponseSerializer},
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
        create_and_send_verification_code(user)
        return Response(
            {
                "message": "Account created. Please check your email for a verification code.",
                "email": user.email,
                "email_verified": user.email_verified,
            },
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


@extend_schema(
    tags=["Authentication"],
    request=VerifyEmailSerializer,
    responses={200: UserProfileSerializer},
)
class VerifyEmailView(APIView):
    """Verify an employee email address using a 6-digit code."""

    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        code = serializer.validated_data["code"]
        try:
            user = verify_email_code(email=email, code=code)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(
            {
                "message": "Email verified successfully. You can now sign in.",
                "user": UserProfileSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


@extend_schema(
    tags=["Authentication"],
    request=ResendVerificationSerializer,
    responses={200: RegistrationResponseSerializer},
)
class ResendVerificationView(APIView):
    """Resend the email verification code."""

    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = ResendVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower()

        from apps.accounts.models import User

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response(
                {"message": "If an account exists with this email, a verification code has been sent."},
                status=status.HTTP_200_OK,
            )

        if user.email_verified:
            return Response(
                {"detail": "This email address is already verified."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        create_and_send_verification_code(user)
        return Response(
            {
                "message": "Verification code sent. Please check your email.",
                "email": user.email,
                "email_verified": user.email_verified,
            },
            status=status.HTTP_200_OK,
        )


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
