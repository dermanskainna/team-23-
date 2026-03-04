import random
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token

from .serializers import UserRegistrationSerializer, ChangePasswordSerializer, UserSerializer
from .models import CustomUser

@api_view(['POST'])
def register_user(request):
    serializer = UserRegistrationSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()

        code = str(random.randint(100000, 999999))

        print(f"\n👉 СЕКРЕТНИЙ КОД ДЛЯ {user.email}: {code}\n")

        user.verification_code = code
        user.save(update_fields=['verification_code'])

        subject = 'Підтвердження реєстрації на платформі ВАРТА'
        message = f'''Вітаємо, {user.full_name or user.username}!

Ви успішно зареєструвалися на волонтерській платформі ВАРТА.
Ваш 6-значний код для підтвердження пошти: {code}

Якщо ви не реєструвалися на нашому сайті, просто проігноруйте цей лист.

Слава Україні!
Команда ВАРТА'''

        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Помилка відправки email: {e}")

        token, created = Token.objects.get_or_create(user=user)

        return Response({
            "user": {
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "full_name": user.full_name,
                "organization": user.organization,
                "is_verified": getattr(user, "is_verified", False)
            },
            "token": token.key
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_email_code(request):
    """Ендпоінт для перевірки 6-значного коду з пошти"""
    code = request.data.get('code')
    user = request.user

    if not code:
        return Response({"error": "Будь ласка, введіть код."}, status=status.HTTP_400_BAD_REQUEST)

    if user.verification_code == code:
        user.verification_code = ''
        user.save(update_fields=['verification_code'])
        return Response({"message": "Пошту успішно підтверджено!"}, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Неправильний код підтвердження."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is not None:
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            "user": {
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "full_name": user.full_name,
                "organization": user.organization,
                "is_verified": getattr(user, "is_verified", False)
            },
            "token": token.key
        }, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Неправильний логін або пароль"}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    request.user.auth_token.delete()
    return Response({"message": "Успішний вихід із системи"}, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_military(request):
    if getattr(request.user, "role", None) != "volunteer":
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    qs = CustomUser.objects.filter(role="military", is_verified=False).order_by("id")

    data = []
    for u in qs:
        data.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "full_name": u.full_name,
            "organization": u.organization,
            "is_verified": u.is_verified,
        })

    return Response(data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_military(request, pk: int):
    if getattr(request.user, "role", None) != "volunteer":
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

    try:
        u = CustomUser.objects.get(pk=pk, role="military")
    except CustomUser.DoesNotExist:
        return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

    u.is_verified = True
    u.save(update_fields=["is_verified"])

    return Response({"detail": "Verified", "id": u.id}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response({"message": "Пароль успішно змінено."}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PATCH':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
