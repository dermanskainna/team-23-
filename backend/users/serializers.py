from rest_framework import serializers
from .models import CustomUser

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
