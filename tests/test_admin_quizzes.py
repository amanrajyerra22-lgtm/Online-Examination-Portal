import requests

BASE_URL = 'http://localhost:8080'

def run_test():
    session_teacher = requests.Session()
    session_admin = requests.Session()

    # 1. Register and Login Teacher
    print("1. Registering Teacher...")
    teacher_reg = {
        "email": "teacher@portal.com",
        "password": "password",
        "firstName": "John",
        "lastName": "Doe",
        "role": "TEACHER"
    }
    # ignore already registered error
    session_teacher.post(f"{BASE_URL}/api/auth/register", json=teacher_reg)

    print("Logging in Teacher...")
    login_data = {
        "email": "teacher@portal.com",
        "password": "password"
    }
    r = session_teacher.post(f"{BASE_URL}/api/auth/login", json=login_data)
    print("Teacher Login Status:", r.status_code)

    print("Creating temporary quiz for delete test...")
    quiz_data = {
        "title": "Admin Delete Test Quiz",
        "description": "Quiz to be deleted by Admin",
        "timeLimitInMinutes": 10,
        "passPercentage": 40.0
    }
    r = session_teacher.post(f"{BASE_URL}/api/quizzes/teacher", json=quiz_data)
    assert r.status_code == 201, f"Expected 201 Created but got {r.status_code}"
    temp_quiz_id = r.json()['id']
    print(f"Created Quiz ID: {temp_quiz_id}")

    # 2. Login Admin
    print("\n2. Logging in Admin...")
    login_data_admin = {
        "email": "admin@portal.com",
        "password": "admin123"
    }
    r = session_admin.post(f"{BASE_URL}/api/auth/login", json=login_data_admin)
    print("Admin Login Status:", r.status_code)
    
    # 3. Fetch quizzes as Admin
    print("\n3. Fetching all quizzes as Admin...")
    r = session_admin.get(f"{BASE_URL}/api/quizzes")
    print("Quizzes list status:", r.status_code)
    quizzes = r.json()
    
    found_quiz = False
    for q in quizzes:
        if q['id'] == temp_quiz_id:
            found_quiz = True
            print(f"Found quiz {temp_quiz_id} in Admin list. Creator: {q.get('createdBy')}")
            break
            
    assert found_quiz, f"Expected to find quiz {temp_quiz_id} in quizzes list"

    # 4. Delete the quiz as Admin
    print(f"\n4. Deleting Quiz ID {temp_quiz_id} as Admin...")
    r = session_admin.delete(f"{BASE_URL}/api/quizzes/teacher/{temp_quiz_id}")
    print("Delete response status:", r.status_code)
    print("Delete response content:", r.text)
    assert r.status_code == 200, f"Expected 200 OK but got {r.status_code}"

    # 5. Verify deletion
    print("\n5. Verifying deletion...")
    r = session_admin.get(f"{BASE_URL}/api/quizzes")
    quizzes_updated = r.json()
    assert not any(q['id'] == temp_quiz_id for q in quizzes_updated), f"Quiz {temp_quiz_id} was not successfully deleted"
    print("SUCCESS! Quiz was successfully deleted by Admin!")

    print("\nSUCCESS! Admin quiz management backend integration verified successfully!")

if __name__ == '__main__':
    run_test()
