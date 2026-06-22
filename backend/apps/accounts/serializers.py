"""Serializers for authentication and profile management."""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.accounts.models import UserRole

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for employee self-registration."""

    password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "phone_number",
            "department",
            "employee_id",
        ]
        read_only_fields = ["id"]

    def validate_email(self, value: str) -> str:
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_employee_id(self, value: str) -> str:
        if User.objects.filter(employee_id__iexact=value).exists():
            raise serializers.ValidationError("This employee ID is already registered.")
        return value

    def validate(self, attrs: dict) -> dict:
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        validate_password(attrs["password"])
        return attrs

    def create(self, validated_data: dict) -> User:
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        user = User.objects.create_user(
            password=password,
            role=UserRole.EMPLOYEE,
            **validated_data,
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """JWT login serializer with user profile in response."""

    username_field = User.USERNAME_FIELD

    @classmethod
    def get_token(cls, user: User):
        token = super().get_token(user)
        token["email"] = user.email
        token["role"] = user.role
        token["full_name"] = user.full_name
        return token

    def validate(self, attrs: dict) -> dict:
        data = super().validate(attrs)
        data["user"] = UserProfileSerializer(self.user).data
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for viewing/updating the authenticated user's profile."""

    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone_number",
            "department",
            "employee_id",
            "role",
            "date_joined",
        ]
        read_only_fields = ["id", "email", "employee_id", "role", "date_joined"]


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for partial profile updates."""

    class Meta:
        model = User
        fields = ["first_name", "last_name", "phone_number", "department"]


class LogoutSerializer(serializers.Serializer):
    """Serializer for blacklisting refresh tokens on logout."""

    refresh = serializers.CharField(required=True)


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin employee management."""

    password = serializers.CharField(
        write_only=True,
        required=False,
        style={"input_type": "password"},
    )
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "password",
            "first_name",
            "last_name",
            "full_name",
            "phone_number",
            "department",
            "employee_id",
            "role",
            "is_active",
            "date_joined",
        ]
        read_only_fields = ["id", "date_joined"]

    def validate_email(self, value: str) -> str:
        queryset = User.objects.filter(email__iexact=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_employee_id(self, value: str) -> str:
        queryset = User.objects.filter(employee_id__iexact=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("This employee ID is already registered.")
        return value

    def validate_password(self, value: str) -> str:
        if value:
            validate_password(value)
        return value

    def create(self, validated_data: dict) -> User:
        password = validated_data.pop("password", None)
        if not password:
            raise serializers.ValidationError({"password": "Password is required."})
        return User.objects.create_user(password=password, **validated_data)

    def update(self, instance: User, validated_data: dict) -> User:
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
