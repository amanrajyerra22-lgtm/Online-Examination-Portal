package com.oep.online_examination_portal.controller.api;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.oep.online_examination_portal.entity.ExamSubmission;
import com.oep.online_examination_portal.entity.Role;
import com.oep.online_examination_portal.entity.User;
import com.oep.online_examination_portal.repository.ExamSubmissionRepository;
import com.oep.online_examination_portal.repository.QuizRepository;
import com.oep.online_examination_portal.repository.UserRepository;
import com.oep.online_examination_portal.service.UserService;

import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/admin")
@Transactional
public class ApiAdminController {

    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final ExamSubmissionRepository submissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    public ApiAdminController(UserRepository userRepository,
                              QuizRepository quizRepository,
                              ExamSubmissionRepository submissionRepository,
                              PasswordEncoder passwordEncoder,
                              UserService userService) {
        this.userRepository = userRepository;
        this.quizRepository = quizRepository;
        this.submissionRepository = submissionRepository;
        this.passwordEncoder = passwordEncoder;
        this.userService = userService;
    }

    // Get statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<User> users = userRepository.findAll();
        long totalUsers = users.size();
        long students = users.stream().filter(u -> u.getRole() == Role.STUDENT).count();
        long teachers = users.stream().filter(u -> u.getRole() == Role.TEACHER).count();
        long admins = users.stream().filter(u -> u.getRole() == Role.ADMIN).count();

        long totalQuizzes = quizRepository.count();
        List<ExamSubmission> submissions = submissionRepository.findAll();
        long totalSubmissions = submissions.size();
        long passedSubmissions = submissions.stream().filter(ExamSubmission::isPassed).count();
        double passRate = totalSubmissions > 0 ? ((double) passedSubmissions / totalSubmissions) * 100.0 : 0.0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalStudents", students);
        stats.put("totalTeachers", teachers);
        stats.put("totalAdmins", admins);
        stats.put("totalQuizzes", totalQuizzes);
        stats.put("totalSubmissions", totalSubmissions);
        stats.put("passRate", passRate);

        return ResponseEntity.ok(stats);
    }

    // List all users with search and filter
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role) {

        List<User> users = userRepository.findAll();

        // Apply role filter
        if (role != null && !role.trim().isEmpty()) {
            try {
                Role filterRole = Role.valueOf(role.trim().toUpperCase());
                users = users.stream()
                        .filter(u -> u.getRole() == filterRole)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException ignored) {}
        }

        // Apply search filter (first name, last name, email)
        if (search != null && !search.trim().isEmpty()) {
            String lowerSearch = search.trim().toLowerCase();
            users = users.stream()
                    .filter(u -> (u.getFirstName() != null && u.getFirstName().toLowerCase().contains(lowerSearch)) ||
                            (u.getLastName() != null && u.getLastName().toLowerCase().contains(lowerSearch)) ||
                            (u.getEmail() != null && u.getEmail().toLowerCase().contains(lowerSearch)))
                    .collect(Collectors.toList());
        }

        List<Map<String, Object>> response = users.stream()
                .map(this::mapUserResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // Update user
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return userRepository.findById(id)
                .map(user -> {
                    String email = payload.get("email");
                    String firstName = payload.get("firstName");
                    String lastName = payload.get("lastName");
                    String roleStr = payload.get("role");
                    String password = payload.get("password");

                    if (email != null && !email.trim().isEmpty()) {
                        // Check if email already exists on another user
                        userRepository.findByEmail(email.trim()).ifPresent(existing -> {
                            if (!existing.getId().equals(id)) {
                                throw new IllegalArgumentException("Email already taken: " + email);
                            }
                        });
                        user.setEmail(email.trim());
                    }

                    if (firstName != null) user.setFirstName(firstName.trim());
                    if (lastName != null) user.setLastName(lastName.trim());

                    if (roleStr != null && !roleStr.trim().isEmpty()) {
                        try {
                            user.setRole(Role.valueOf(roleStr.trim().toUpperCase()));
                        } catch (IllegalArgumentException ignored) {}
                    }

                    if (password != null && !password.trim().isEmpty()) {
                        user.setPassword(passwordEncoder.encode(password.trim()));
                    }

                    try {
                        User saved = userRepository.save(user);
                        return ResponseEntity.ok(mapUserResponse(saved));
                    } catch (IllegalArgumentException e) {
                        Map<String, String> err = new HashMap<>();
                        err.put("error", e.getMessage());
                        return ResponseEntity.badRequest().body(err);
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        if (currentUser != null && currentUser.getId().equals(id)) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Cannot delete your own account.");
            return ResponseEntity.badRequest().body(err);
        }

        try {
            userService.deleteUser(id);
            Map<String, String> msg = new HashMap<>();
            msg.put("message", "User deleted successfully");
            return ResponseEntity.ok(msg);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Failed to delete user: " + e.getMessage());
            return ResponseEntity.status(500).body(err);
        }
    }

    // Get user score attempts history
    @GetMapping("/users/{id}/submissions")
    public ResponseEntity<List<Map<String, Object>>> getUserSubmissions(@PathVariable Long id) {
        List<ExamSubmission> submissions = submissionRepository.findByStudentId(id);
        List<Map<String, Object>> response = submissions.stream()
                .map(sub -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", sub.getId());
                    map.put("score", sub.getScore());
                    map.put("totalQuestions", sub.getTotalQuestions());
                    map.put("correctAnswers", sub.getCorrectAnswers());
                    map.put("passed", sub.isPassed());
                    map.put("submissionDate", sub.getSubmissionDate() != null ? sub.getSubmissionDate().toString() : "");
                    if (sub.getQuiz() != null) {
                        map.put("quizTitle", sub.getQuiz().getTitle());
                    }
                    return map;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> mapUserResponse(User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("role", user.getRole().name());
        return response;
    }
}
