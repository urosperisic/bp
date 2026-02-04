# accounts/authentication.py

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed


class JWTCookieAuthentication(JWTAuthentication):
    """
    Custom authentication class koja čita JWT iz httpOnly cookies
    """

    def authenticate(self, request):
        # Prvo pokušaj iz cookies
        raw_token = request.COOKIES.get("access_token")

        if raw_token is None:
            # Fallback na standard Authorization header
            return super().authenticate(request)

        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except Exception:
            raise AuthenticationFailed("Invalid or expired token")
