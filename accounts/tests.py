# accounts/tests.py


from django.test import TestCase
from django.contrib.auth import get_user_model

from django.db import IntegrityError

User = get_user_model()


class CustomUserModelTest(TestCase):
    print("\n*****\n")
    print(User)
    print("\n*****\n")

    def test_create_user(self):
        user = User.objects.create_user(username="testuser", password="testpass123")
        self.assertEqual(user.username, "testuser")
        self.assertTrue(user.check_password("testpass123"))

    def test_default_role_is_user(self):
        user = User.objects.create_user(username="test", password="pass")
        self.assertEqual(user.role, "user")

    def test_create_admin_user(self):
        user = User.objects.create_user(username="admin", password="pass", role="admin")
        self.assertEqual(user.role, "admin")

    def test_str_method(self):
        user = User.objects.create_user(username="john", password="pass")
        self.assertEqual(str(user), "john (user)")

    def test_username_unique(self):
        User.objects.create_user(username="test", password="pass")

        with self.assertRaises(IntegrityError):
            User.objects.create_user(username="test", password="pass2")
