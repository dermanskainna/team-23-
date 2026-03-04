from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth.password_validation import validate_password

class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('username', 'password', 'email', 'role', 'full_name', 'phone', 'organization', 'is_verified')
        extra_kwargs = {'password': {'write_only': True}, 'is_verified': {'read_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        role = validated_data.get("role", "military")
        validated_data["is_verified"] = (role == "volunteer")
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'role', 'full_name', 'phone', 'organization', 'is_verified')
        read_only_fields = ('username', 'email', 'role', 'is_verified')

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Неправильний старий пароль.")
        return value
