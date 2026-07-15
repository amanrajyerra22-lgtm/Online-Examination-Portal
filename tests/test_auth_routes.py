import requests

BASE_URL = 'http://localhost:8080'

def run_test():
    # Guests / Unauthenticated session
    session_guest = requests.Session()
    
    # 1. Guest trying to access protected api (should get 401 Unauthorized)
    print("1. Guest requesting /api/quizzes...")
    r = session_guest.get(f"{BASE_URL}/api/quizzes")
    print("Guest Quiz Status:", r.status_code)
    assert r.status_code == 401, f"Expected 401 but got {r.status_code}"

    # 2. Guest requesting teacher quizzes (should get 401 Unauthorized)
    print("\n2. Guest requesting /api/quizzes/teacher...")
    r = session_guest.get(f"{BASE_URL}/api/quizzes/teacher")
    print("Guest Teacher Quiz Status:", r.status_code)
    assert r.status_code == 401, f"Expected 401 but got {r.status_code}"

    # 3. Guest requesting admin stats api (should get 401 Unauthorized)
    print("\n3. Guest requesting /api/admin/stats...")
    r = session_guest.get(f"{BASE_URL}/api/admin/stats")
    print("Guest Admin Stats Status:", r.status_code)
    assert r.status_code == 401, f"Expected 401 but got {r.status_code}"

    # Student Session
    session_student = requests.Session()
    print("\n4. Logging in Student (student@portal.com)...")
    r = session_student.post(f"{BASE_URL}/api/auth/login", json={"email": "student@portal.com", "password": "password"})
    print("Student Login Status:", r.status_code)
    assert r.status_code == 200

    # 5. Student checks session details (/api/auth/me)
    print("\n5. Fetching /api/auth/me as Student...")
    r = session_student.get(f"{BASE_URL}/api/auth/me")
    print("Me Status:", r.status_code)
    me_data = r.json()
    print("Me Role:", me_data.get('role'))
    assert me_data.get('role') == 'STUDENT'

    # 6. Student trying to access teacher quizzes (should get 403 Forbidden)
    print("\n6. Student requesting /api/quizzes/teacher...")
    r = session_student.get(f"{BASE_URL}/api/quizzes/teacher")
    print("Student Teacher Quiz Status:", r.status_code)
    assert r.status_code == 403, f"Expected 403 but got {r.status_code}"

    # 7. Student trying to access teacher submissions (should get 403 Forbidden)
    print("\n7. Student requesting /api/submissions/teacher...")
    r = session_student.get(f"{BASE_URL}/api/submissions/teacher")
    print("Student Teacher Submissions Status:", r.status_code)
    assert r.status_code == 403, f"Expected 403 but got {r.status_code}"

    # 8. Student trying to access admin api (should get 403 Forbidden)
    print("\n8. Student requesting /api/admin/users...")
    r = session_student.get(f"{BASE_URL}/api/admin/users")
    print("Student Admin Users Status:", r.status_code)
    assert r.status_code == 403, f"Expected 403 but got {r.status_code}"

    # Teacher Session
    session_teacher = requests.Session()
    print("\n9. Logging in Teacher (teacher@portal.com)...")
    r = session_teacher.post(f"{BASE_URL}/api/auth/login", json={"email": "teacher@portal.com", "password": "password"})
    print("Teacher Login Status:", r.status_code)
    assert r.status_code == 200

    # 10. Teacher accessing teacher quizzes (should get 200 OK)
    print("\n10. Teacher requesting /api/quizzes/teacher...")
    r = session_teacher.get(f"{BASE_URL}/api/quizzes/teacher")
    print("Teacher Quiz Status:", r.status_code)
    assert r.status_code == 200

    # 11. Teacher accessing teacher submissions (should get 200 OK)
    print("\n11. Teacher requesting /api/submissions/teacher...")
    r = session_teacher.get(f"{BASE_URL}/api/submissions/teacher")
    print("Teacher Submissions Status:", r.status_code)
    assert r.status_code == 200

    # 12. Teacher trying to access admin api (should get 403 Forbidden)
    print("\n12. Teacher requesting /api/admin/users...")
    r = session_teacher.get(f"{BASE_URL}/api/admin/users")
    print("Teacher Admin Users Status:", r.status_code)
    assert r.status_code == 403, f"Expected 403 but got {r.status_code}"

    # Admin Session
    session_admin = requests.Session()
    print("\n13. Logging in Admin (admin@portal.com)...")
    r = session_admin.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@portal.com", "password": "admin123"})
    print("Admin Login Status:", r.status_code)
    assert r.status_code == 200

    # 14. Admin accessing teacher quizzes (should get 200 OK)
    print("\n14. Admin requesting /api/quizzes/teacher...")
    r = session_admin.get(f"{BASE_URL}/api/quizzes/teacher")
    print("Admin Teacher Quiz Status:", r.status_code)
    assert r.status_code == 200

    # 15. Admin accessing admin api (should get 200 OK)
    print("\n15. Admin requesting /api/admin/users...")
    r = session_admin.get(f"{BASE_URL}/api/admin/users")
    print("Admin Admin Users Status:", r.status_code)
    assert r.status_code == 200

    # Logout verification
    print("\n16. Logging out Admin...")
    r = session_admin.post(f"{BASE_URL}/api/auth/logout")
    print("Logout Status:", r.status_code)
    # verify session is cleared
    r = session_admin.get(f"{BASE_URL}/api/auth/me")
    print("Admin session check after logout (should get 401 or null):", r.status_code)
    assert r.status_code == 401 or r.json() is None, "Session was not successfully cleared"

    print("\nSUCCESS! Authentication and Role-based Route Protection verified successfully!")

if __name__ == '__main__':
    run_test()
