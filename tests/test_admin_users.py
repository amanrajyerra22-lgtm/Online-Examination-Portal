import requests
import time

BASE_URL = 'http://localhost:8080'

def run_test():
    session_admin = requests.Session()
    session_teacher = requests.Session()
    session_student = requests.Session()
    
    unique_suffix = str(int(time.time()))
    temp_teacher_email = f"temp_teacher_{unique_suffix}@portal.com"
    temp_student_email = f"temp_student_{unique_suffix}@portal.com"

    # 1. Register temporary Teacher & Student
    print("1. Registering temporary Teacher & Student...")
    requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": temp_teacher_email,
        "password": "password",
        "firstName": "Temp",
        "lastName": "Teacher",
        "role": "TEACHER"
    })
    
    requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": temp_student_email,
        "password": "password",
        "firstName": "Temp",
        "lastName": "Student",
        "role": "STUDENT"
    })

    # Login Teacher to create a quiz
    r = session_teacher.post(f"{BASE_URL}/api/auth/login", json={"email": temp_teacher_email, "password": "password"})
    teacher_id = r.json()['id']
    
    # Create quiz
    r = session_teacher.post(f"{BASE_URL}/api/quizzes/teacher", json={
        "title": f"Temp Quiz {unique_suffix}",
        "description": "To be deleted on user cascade",
        "timeLimitInMinutes": 10,
        "passPercentage": 40.0
    })
    quiz_id = r.json()['id']
    print(f"Created Quiz ID: {quiz_id} by Teacher ID: {teacher_id}")

    # Login Student to submit attempt
    r = session_student.post(f"{BASE_URL}/api/auth/login", json={"email": temp_student_email, "password": "password"})
    student_id = r.json()['id']
    
    # Submit attempt
    r = session_student.post(f"{BASE_URL}/api/submissions/quiz/{quiz_id}", json={})
    submission_id = r.json()['id']
    print(f"Created Submission ID: {submission_id} by Student ID: {student_id}")

    # 2. Login Admin
    print("\n2. Logging in Admin...")
    r = session_admin.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@portal.com", "password": "admin123"})
    print("Admin Login Status:", r.status_code)
    
    # 3. Retrieve user list and verify temp users are present
    print("\n3. Verifying users in Admin directory...")
    r = session_admin.get(f"{BASE_URL}/api/admin/users")
    users = r.json()
    teacher_exists = any(u['id'] == teacher_id for u in users)
    student_exists = any(u['id'] == student_id for u in users)
    assert teacher_exists and student_exists, "Expected temp users to exist in list"
    print("Temp users successfully verified in list!")

    # 4. Modify temp user details (e.g. Student name)
    print("\n4. Modifying Student profile...")
    r = session_admin.put(f"{BASE_URL}/api/admin/users/{student_id}", json={
        "firstName": "UpdatedFirstName",
        "lastName": "UpdatedLastName",
        "email": temp_student_email,
        "role": "STUDENT"
    })
    print("Update status:", r.status_code)
    updated_user = r.json()
    assert updated_user['firstName'] == 'UpdatedFirstName', "Expected firstName to be updated"
    print("Student profile successfully updated!")

    # 5. Delete Teacher (should cascade delete the quiz and its submissions)
    print(f"\n5. Deleting Teacher (ID: {teacher_id})...")
    r = session_admin.delete(f"{BASE_URL}/api/admin/users/{teacher_id}")
    print("Delete status:", r.status_code)
    assert r.status_code == 200

    # Verify quiz is gone
    print("Checking if quiz is deleted...")
    r = session_admin.get(f"{BASE_URL}/api/quizzes")
    quizzes = r.json()
    assert not any(q['id'] == quiz_id for q in quizzes), "Expected quiz to be deleted by cascade"
    print("Quiz successfully verified deleted!")

    # Verify submission is gone
    print("Checking if submission is deleted...")
    r = session_admin.get(f"{BASE_URL}/api/submissions/teacher")
    submissions = r.json()
    assert not any(s['id'] == submission_id for s in submissions), "Expected submission to be deleted by cascade"
    print("Submission successfully verified deleted!")

    # 6. Delete Student
    print(f"\n6. Deleting Student (ID: {student_id})...")
    r = session_admin.delete(f"{BASE_URL}/api/admin/users/{student_id}")
    print("Delete status:", r.status_code)
    assert r.status_code == 200

    # Verify student is gone from directory
    r = session_admin.get(f"{BASE_URL}/api/admin/users")
    users_after = r.json()
    assert not any(u['id'] == student_id for u in users_after), "Expected student to be deleted"
    print("Student successfully verified deleted!")

    print("\nSUCCESS! User management and cascading deletion verified successfully!")

if __name__ == '__main__':
    run_test()
