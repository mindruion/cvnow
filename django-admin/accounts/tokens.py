
# accounts/tokens.py
from django.contrib.auth.tokens import PasswordResetTokenGenerator

class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        # Include is_active so token invalidates after activation
        return f"{user.pk}{timestamp}{user.is_active}"

account_activation_token = AccountActivationTokenGenerator()
