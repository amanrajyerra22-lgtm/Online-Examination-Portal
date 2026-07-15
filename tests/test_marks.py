import requests

BASE_URL = 'http://localhost:8080'

def run_test():
    session_teacher = requests.Session()
    session_student = requests.Session()

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
        "title": "Weighted Score Quiz",
        "description": "Quiz with weighted questions",
        "timeLimitInMinutes": 10,
        "passPercentage": 40.0
    }
    r = session_teacher.post(f"{BASE_URL}/api/quizzes/teacher", json=quiz_data)
    print("Quiz Creation Status:", r.status_code)
    quiz_id = r.json()['id']
    print("Quiz ID:", quiz_id)

    # 3. Add Questions with different weights (marks)
    print("\n3. Adding Question 1 (Weight: 5.0, Correct Answer: A)...")
    q1_data = {
        "content": "What is 2 + 2?",
        "optionA": "4",
        "optionB": "5",
        "optionC": "6",
        "optionD": "7",
        "correctAnswer": "A",
        "marks": 5.0
    }
    r = session_teacher.post(f"{BASE_URL}/api/teacher/quizzes/{quiz_id}/questions", json=q1_data)
    print("Q1 Status:", r.status_code)
    q1_id = r.json()['id']

    print("\n4. Adding Question 2 (Weight: 10.0, Correct Answer: B)...")
    q2_data = {
        "content": "What is 3 + 3?",
        "optionA": "5",
        "optionB": "6",
        "optionC": "7",
        "optionD": "8",
        "correctAnswer": "B",
        "marks": 10.0
    }
    r = session_teacher.post(f"{BASE_URL}/api/teacher/quizzes/{quiz_id}/questions", json=q2_data)
    print("Q2 Status:", r.status_code)
    q2_id = r.json()['id']

    # 5. Register & Login Student
    print("\n5. Registering Student...")
    student_reg = {
        "email": "student@portal.com",
        "password": "password",
        "firstName": "Jane",
        "lastName": "Doe",
        "role": "STUDENT"
    }
    # ignore already registered error
    session_student.post(f"{BASE_URL}/api/auth/register", json=student_reg)
    
    print("Logging in Student...")
    r = session_student.post(f"{BASE_URL}/api/auth/login", json={"email": "student@portal.com", "password": "password"})
    print("Student Login Status:", r.status_code)

    # 6. Submit answers
    # Q1 is Correct (A), Q2 is Incorrect (A)
    # Total marks = 15.0, Earned = 5.0. Expected percentage = 33.333%
    print("\n6. Submitting exam...")
    submission_payload = {
        f"question_{q1_id}": "A",
        f"question_{q2_id}": "A"
    }
    r = session_student.post(f"{BASE_URL}/api/submissions/quiz/{quiz_id}", json=submission_payload)
    print("Submission Status:", r.status_code)
    submission_data = r.json()
    print("Submission Score:", submission_data['score'])
    print("Correct Answers Count:", submission_data['correctAnswers'])
    print("Passed:", submission_data['passed'])

    # Assert correctness
    expected_score = (5.0 / 15.0) * 100
    assert abs(submission_data['score'] - expected_score) < 0.01, f"Expected around {expected_score} but got {submission_data['score']}"
    print("\nSUCCESS! Custom marks and weighted scoring verified successfully!")

if __name__ == '__main__':
    run_test()
