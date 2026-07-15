# 🎓 Online Examination Portal

A full-stack web application for conducting online examinations with role-based access for **Students**, **Teachers**, and **Administrators**. The system allows teachers to create and manage quizzes, students to take exams and view results, and administrators to manage users and monitor the platform.

---

## 📌 Features

### 👨‍🎓 Student
- User Registration & Login
- View Available Quizzes
- Attempt Online Quizzes
- Live Countdown Timer
- Automatic Score Calculation
- View Quiz Results & Performance
- Single Attempt Enforcement

### 👨‍🏫 Teacher
- Create, Edit, and Delete Quizzes
- Add, Edit, and Delete Questions
- Assign Custom Marks for Each Question
- View Student Submissions
- Manage Quiz Configurations

### 👨‍💼 Admin
- Secure Admin Dashboard
- View All Users
- Manage Student & Teacher Accounts
- Edit/Delete User Information
- View and Manage All Teacher Quizzes
- Monitor Student Submissions
- Dashboard Statistics

---

## 🚀 Technologies Used

### Frontend
- React.js (JavaScript)
- React Router
- Axios
- CSS

### Backend
- Spring Boot
- Spring Security
- Spring Data JPA
- REST APIs

### Database
- MySQL

### Build Tools
- Maven
- Vite

---

## 📂 Project Structure

```
Online_Examination_Portal/
│
├── frontend/             # React Frontend
├── src/                  # Spring Boot Backend
├── tests/                # Verification Scripts
├── pom.xml
├── README.md
└── walkthrough.md
```

---

## ⚙️ Prerequisites

- Java 17+
- Maven
- Node.js (v18 or later)
- npm
- MySQL 8+
- Git

---

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Online-Examination-Portal.git
cd Online-Examination-Portal
```

### 2. Configure MySQL

Create a database:

```sql
CREATE DATABASE online_exam_portal;
```

Update your database credentials in:

```
src/main/resources/application.properties
```

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/online_exam_portal
spring.datasource.username=root
spring.datasource.password=your_password
```

---

## ▶️ Run the Backend

```bash
./mvnw spring-boot:run
```

Windows:

```cmd
.\mvnw.cmd spring-boot:run
```

Backend runs on:

```
http://localhost:8080
```

---

## ▶️ Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🔑 Default Admin Login

```
Email:
admin@portal.com

Password:
admin123
```

---

## 📊 Database Tables

- users
- quizzes
- questions
- exam_submissions
- user_answers

---

## 📈 Scoring System

The portal supports weighted question marks.

Score is calculated as:

```
Score (%) = (Earned Marks / Total Quiz Marks) × 100
```

---

## 🔒 Security Features

- Role-Based Authentication
- Protected Routes
- Secure REST APIs
- Password Encryption
- Session Management

---

## 🧪 Testing

Verification scripts are available in:

```
tests/
```

Example:

```bash
python tests/test_quiz.py
python tests/test_marks.py
python tests/test_attempts.py
python tests/test_admin_users.py
python tests/test_admin_quizzes.py
python tests/test_auth_routes.py
```

---

## 👥 Stakeholders

- Students
- Teachers
- Administrator
- Institution Management
- Development Team

---

## 📸 Screenshots

Add screenshots of:

- Login Page
- Student Dashboard
- Teacher Dashboard
- Admin Dashboard
- Quiz Creation
- Quiz Attempt
- Result Page

---

## 🔮 Future Enhancements

- Google Login
- Email Notifications
- Certificate Generation
- Question Import via Excel
- AI-Based Proctoring
- Analytics Dashboard
- Mobile Responsive UI
- Dark Mode
- Multi-language Support

---

## 👨‍💻 Author

**Aman Raj**

B.Tech – Artificial Intelligence & Machine Learning

---

## 📄 License

This project is developed for educational purposes.