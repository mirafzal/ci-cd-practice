from django.test import TestCase
from .models import Task

class TaskModelTest(TestCase):
    def test_string_representation(self):
        task = Task(title="Write tests")
        print(f"Testing task title: {task.title}")  # 👈 Output
        self.assertEqual(str(task), "Write tests")