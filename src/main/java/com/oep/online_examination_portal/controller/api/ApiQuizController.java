package com.oep.online_examination_portal.controller.api;

import com.oep.online_examination_portal.entity.Question;
import com.oep.online_examination_portal.entity.Quiz;
import com.oep.online_examination_portal.entity.Role;
import com.oep.online_examination_portal.entity.User;
import com.oep.online_examination_portal.service.QuizService;
import com.oep.online_examination_portal.entity.ExamSubmission;
import com.oep.online_examination_portal.repository.ExamSubmissionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quizzes")
@Transactional
public class ApiQuizController {

    private final QuizService quizService;
    private final ExamSubmissionRepository submissionRepository;

    public ApiQuizController(QuizService quizService, ExamSubmissionRepository submissionRepository) {
        this.quizService = quizService;
        this.submissionRepository = submissionRepository;
    }

    // List all quizzes (for student view)
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getQuizzes(@AuthenticationPrincipal User user) {
        List<Quiz> quizzes = quizService.getAllQuizzes();
        List<Map<String, Object>> response = quizzes.stream()
                .map(quiz -> {
                    Map<String, Object> summary = mapQuizSummary(quiz);
                    if (user != null && user.getRole() == Role.STUDENT) {
                        Optional<ExamSubmission> subOpt = submissionRepository.findFirstByStudentIdAndQuizId(user.getId(), quiz.getId());
                        if (subOpt.isPresent()) {
                            summary.put("attempted", true);
                            summary.put("submissionId", subOpt.get().getId());
                        } else {
                            summary.put("attempted", false);
                        }
                    }
                    return summary;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // Get specific quiz details (safely mapped depending on user role)
    @GetMapping("/{id}")
    public ResponseEntity<?> getQuizById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        if (user != null && user.getRole() == Role.STUDENT) {
            Optional<ExamSubmission> subOpt = submissionRepository.findFirstByStudentIdAndQuizId(user.getId(), id);
            if (subOpt.isPresent()) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "You have already completed this quiz.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(err);
            }
        }

        return quizService.findQuizById(id)
                .map(quiz -> ResponseEntity.ok(mapQuizDetails(quiz, user)))
                .orElse(ResponseEntity.notFound().build());
    }

    // List quizzes created by a teacher
    @GetMapping("/teacher")
    public ResponseEntity<List<Map<String, Object>>> getTeacherQuizzes(@AuthenticationPrincipal User user) {
        List<Quiz> quizzes = quizService.getQuizzesByCreator(user);
        List<Map<String, Object>> response = quizzes.stream()
                .map(this::mapQuizSummary)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // Create a new quiz (teacher/admin only)
    @PostMapping("/teacher")
    public ResponseEntity<?> createQuiz(@RequestBody Quiz quiz, @AuthenticationPrincipal User user) {
        try {
            Quiz created = quizService.createQuiz(quiz, user);
            return ResponseEntity.status(HttpStatus.CREATED).body(mapQuizSummary(created));
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    // Edit quiz (teacher/admin only)
    @PutMapping("/teacher/{id}")
    public ResponseEntity<?> updateQuiz(@PathVariable Long id, @RequestBody Quiz quizDetails) {
        try {
            Quiz updated = quizService.updateQuiz(id, quizDetails);
            return ResponseEntity.ok(mapQuizSummary(updated));
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    // Delete quiz (teacher/admin only)
    @DeleteMapping("/teacher/{id}")
    public ResponseEntity<?> deleteQuiz(@PathVariable Long id) {
        try {
            quizService.deleteQuiz(id);
            Map<String, String> msg = new HashMap<>();
            msg.put("message", "Quiz deleted successfully");
            return ResponseEntity.ok(msg);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    private Map<String, Object> mapQuizSummary(Quiz quiz) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", quiz.getId());
        response.put("title", quiz.getTitle());
        response.put("description", quiz.getDescription());
        response.put("timeLimitInMinutes", quiz.getTimeLimitInMinutes());
        response.put("passPercentage", quiz.getPassPercentage());
        response.put("questionCount", quiz.getQuestions() != null ? quiz.getQuestions().size() : 0);
        if (quiz.getCreatedBy() != null) {
            response.put("createdBy", quiz.getCreatedBy().getFirstName() + " " + quiz.getCreatedBy().getLastName());
        }
        return response;
    }

    private Map<String, Object> mapQuizDetails(Quiz quiz, User user) {
        Map<String, Object> response = mapQuizSummary(quiz);
        boolean isStudent = user != null && user.getRole() == Role.STUDENT;

        List<Map<String, Object>> questionsList = new ArrayList<>();
        if (quiz.getQuestions() != null) {
            for (Question q : quiz.getQuestions()) {
                Map<String, Object> qMap = new HashMap<>();
                qMap.put("id", q.getId());
                qMap.put("content", q.getContent());
                qMap.put("optionA", q.getOptionA());
                qMap.put("optionB", q.getOptionB());
                qMap.put("optionC", q.getOptionC());
                qMap.put("optionD", q.getOptionD());
                qMap.put("marks", q.getMarks());
                if (!isStudent) {
                    qMap.put("correctAnswer", q.getCorrectAnswer());
                }
                questionsList.add(qMap);
            }
        }
        response.put("questions", questionsList);
        return response;
    }
}
