import requests

BASE_URL = 'http://localhost:8080'

def run_test():
    session = requests.Session()

    # 1. Register
    reg_data = {
        "email": "teacher@portal.com",
        "password": "password",
        "firstName": "Test",
        "lastName": "Teacher",
        "role": "TEACHER"
    }
    
    print("1. Registering user...")
    r = session.post(f"{BASE_URL}/api/auth/register", json=reg_data)
    print("Status:", r.status_code)
    print("Response:", r.text)

    # 2. Login
    login_data = {
        "email": "teacher@portal.com",
        "password": "password"
    }
    print("\n2. Logging in...")
    r = session.post(f"{BASE_URL}/api/auth/login", json=login_data)
    print("Status:", r.status_code)
    print("Response:", r.text)

    # 3. Create Quiz
    quiz_data = {
        "title": "Java Basics Quiz",
        "description": "Introduction to Java syntax and concepts",
        "timeLimitInMinutes": 30,
        "passPercentage": 60.0
    }
    print("\n3. Creating Quiz...")
    r = session.post(f"{BASE_URL}/api/quizzes/teacher", json=quiz_data)
    print("Status:", r.status_code)
    print("Response:", r.text)

    # 4. Fetch Quizzes List
    print("\n4. Fetching Quizzes List...")
    r = session.get(f"{BASE_URL}/api/quizzes/teacher")
    print("Status:", r.status_code)
    print("Response:", r.text)

if __name__ == '__main__':
    run_test()
