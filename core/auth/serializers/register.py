from rest_framework import serializers
from core.user.models import User
from core.user.serializers import UserSerializer
from captcha.models import CaptchaStore
class RegisterSerializer(UserSerializer):
    password = serializers.CharField(max_length=256, min_length=8, write_only=True, required=True, style={'input_type': 'password'})
    captcha_key = serializers.CharField(write_only=True)    
    captcha_value = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            captcha = CaptchaStore.objects.get(hashkey=data['captcha_key'])
        except CaptchaStore.DoesNotExist:
            raise serializers.ValidationError({"captcha": "Неверный ключ капчи"})

        if captcha.response != data['captcha_value'].lower():
            raise serializers.ValidationError({"captcha": "Неверное значение капчи"})

        return data
    class Meta(UserSerializer.Meta):
        model = User
        fields = ['id','username','email','bio','avatar','first_name','last_name','password','captcha_key','captcha_value']

    def create(self, validated_data):
        captcha_key = validated_data.pop('captcha_key')
        captcha_value = validated_data.pop('captcha_value')

        user = User.objects.create_user(**validated_data)
        user.is_active = False
        user.save()

        return user