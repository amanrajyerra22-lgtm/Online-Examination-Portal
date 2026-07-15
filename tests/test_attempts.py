import requests
import time

BASE_URL = 'http://localhost:8080'

def run_test():
    session_teacher = requests.Session()
    session_student = requests.Session()
    unique_suffix = str(int(time.time()))

    # 1. Login Teacher
    print("1. Logging in Teacher...")
    login_data = {
        "email": "teacher@portal.com",
        "password": "password"
    }
    r = session_teacher.post(f"{BASE_URL}/api/auth/login", json=login_data)
    print("Teacher Login Status:", r.status_code)

    # 2. Create Quiz
    print("\n2. Creating Quiz...")
    quiz_data = {
        "title": f"Attempt Test Quiz {unique_suffix}",
        "description": "Verification of single-attempt enforcement",
        "timeLimitInMinutes": 10,
        "passPercentage": 50.0
    }
    r = session_teacher.post(f"{BASE_URL}/api/quizzes/teacher", json=quiz_data)
    print("Quiz Creation Status:", r.status_code)
    quiz = r.json()
    quiz_id = quiz['id']
    print("Quiz ID:", quiz_id)

    # 3. Add Question
    print("\n3. Adding Question...")
    q_data = {
        "content": "What is 2+2?",
        "optionA": "3",
        "optionB": "4",
        "optionC": "5",
        "optionD": "6",
        "correctAnswer": "B",
        "marks": 2.0
    }
    r = session_teacher.post(f"{BASE_URL}/api/teacher/quizzes/{quiz_id}/questions", json=q_data)
    print("Question Status:", r.status_code)

    # 4. Login Student
    print("\n4. Logging in Student...")
    student_login = {
        "email": "student@portal.com",
        "password": "password"
    }
    r = session_student.post(f"{BASE_URL}/api/auth/login", json=student_login)
    print("Student Login Status:", r.status_code)

    # 5. Submit first attempt
    print("\n5. Submitting first attempt...")
    sub_data = {
        "question_1": "B"
    }
    r = session_student.post(f"{BASE_URL}/api/submissions/quiz/{quiz_id}", json=sub_data)
    print("First submission status:", r.status_code)
    assert r.status_code == 200, f"Expected 200 but got {r.status_code}"

    # 6. Try to fetch quiz details again
    print(f"\n6. Attempting to fetch Quiz {quiz_id} details (GET /api/quizzes/{quiz_id})...")
    r = session_student.get(f"{BASE_URL}/api/quizzes/{quiz_id}")
    print("GET details status:", r.status_code)
    print("GET details response:", r.text)
    assert r.status_code == 403, f"Expected 403 Forbidden but got {r.status_code}"
    assert "already completed" in r.text.lower(), "Expected already completed error message"

    # 7. Try to submit answers again
    print(f"\n7. Attempting to submit answers for Quiz {quiz_id} again (POST /api/submissions/quiz/{quiz_id})...")
    r = session_student.post(f"{BASE_URL}/api/submissions/quiz/{quiz_id}", json={})
    print("POST submission status:", r.status_code)
    print("POST submission response:", r.text)
    assert r.status_code == 400, f"Expected 400 Bad Request but got {r.status_code}"
    assert "already submitted" in r.text.lower(), "Expected already submitted error message"

    print("\nSUCCESS! Single-attempt enforcement verified successfully!")

if __name__ == '__main__':
    run_test()
