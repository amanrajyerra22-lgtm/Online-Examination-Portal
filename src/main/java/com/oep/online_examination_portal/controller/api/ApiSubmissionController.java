package com.oep.online_examination_portal.controller.api;

import com.oep.online_examination_portal.entity.ExamSubmission;
import com.oep.online_examination_portal.entity.Question;
import com.oep.online_examination_portal.entity.User;
import com.oep.online_examination_portal.entity.UserAnswer;
import com.oep.online_examination_portal.repository.ExamSubmissionRepository;
import com.oep.online_examination_portal.service.ExamSubmissionService;
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
@RequestMapping("/api/submissions")
@Transactional
public class ApiSubmissionController {

    private final ExamSubmissionService examSubmissionService;
    private final ExamSubmissionRepository submissionRepository;

    public ApiSubmissionController(ExamSubmissionService examSubmissionService, ExamSubmissionRepository submissionRepository) {
        this.examSubmissionService = examSubmissionService;
        this.submissionRepository = submissionRepository;
    }

    // Submit a quiz attempt
    @PostMapping("/quiz/{quizId}")
    public ResponseEntity<?> submitQuiz(
            @PathVariable Long quizId,
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> rawAnswers) {

        if (user == null) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Unauthorized. Please log in.");
            return ResponseEntity.status(401).body(err);
        }

        Optional<ExamSubmission> existing = submissionRepository.findFirstByStudentIdAndQuizId(user.getId(), quizId);
        if (existing.isPresent()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "You have already submitted an attempt for this quiz.");
            return ResponseEntity.badRequest().body(err);
        }

        // Convert key format: "question_1" -> 1
        Map<Long, String> answers = new HashMap<>();
        for (Map.Entry<String, String> entry : rawAnswers.entrySet()) {
            String key = entry.getKey();
            try {
                if (key.startsWith("question_")) {
                    Long qId = Long.parseLong(key.substring(9));
                    answers.put(qId, entry.getValue());
                } else {
                    Long qId = Long.parseLong(key);
                    answers.put(qId, entry.getValue());
                }
            } catch (NumberFormatException ignored) {}
        }

        try {
            ExamSubmission submission = examSubmissionService.submitExam(quizId, user, answers);
            return ResponseEntity.ok(mapSubmissionDetails(submission));
        } catch (IllegalStateException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Failed to submit exam: " + e.getMessage());
            return ResponseEntity.status(500).body(err);
        }
    }

    // Get submission by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getSubmissionById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        return examSubmissionService.findSubmissionById(id)
                .map(submission -> {
                    // Security check: Only the student who submitted or a teacher/admin can view this
                    if (!submission.getStudent().getId().equals(user.getId()) &&
                            !user.getRole().name().equals("TEACHER") &&
                            !user.getRole().name().equals("ADMIN")) {
                        return ResponseEntity.status(403).build();
                    }
                    return ResponseEntity.ok(mapSubmissionDetails(submission));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Get current student's exam history
    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getStudentHistory(@AuthenticationPrincipal User user) {
        List<ExamSubmission> submissions = examSubmissionService.getSubmissionsByStudent(user);
        List<Map<String, Object>> response = submissions.stream()
                .map(this::mapSubmissionSummary)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // Get all submissions across the system (teacher/admin only)
    @GetMapping("/teacher")
    public ResponseEntity<List<Map<String, Object>>> getAllSubmissions() {
        List<ExamSubmission> submissions = examSubmissionService.getAllSubmissions();
        List<Map<String, Object>> response = submissions.stream()
                .map(this::mapSubmissionSummary)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> mapSubmissionSummary(ExamSubmission submission) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", submission.getId());
        map.put("score", submission.getScore());
        map.put("totalQuestions", submission.getTotalQuestions());
        map.put("correctAnswers", submission.getCorrectAnswers());
        map.put("passed", submission.isPassed());
        map.put("submissionDate", submission.getSubmissionDate() != null ? submission.getSubmissionDate().toString() : "");
        if (submission.getStudent() != null) {
            map.put("studentId", submission.getStudent().getId());
            map.put("studentName", submission.getStudent().getFirstName() + " " + submission.getStudent().getLastName());
            map.put("studentEmail", submission.getStudent().getEmail());
        }
        if (submission.getQuiz() != null) {
            map.put("quizId", submission.getQuiz().getId());
            map.put("quizTitle", submission.getQuiz().getTitle());
        }
        return map;
    }

    private Map<String, Object> mapSubmissionDetails(ExamSubmission submission) {
        Map<String, Object> map = mapSubmissionSummary(submission);
        List<Map<String, Object>> answersList = new ArrayList<>();
        if (submission.getUserAnswers() != null) {
            for (UserAnswer ua : submission.getUserAnswers()) {
                Map<String, Object> uaMap = new HashMap<>();
                uaMap.put("id", ua.getId());
                uaMap.put("selectedAnswer", ua.getSelectedAnswer());
                uaMap.put("isCorrect", ua.isCorrect());

                Question q = ua.getQuestion();
                if (q != null) {
                    uaMap.put("questionId", q.getId());
                    uaMap.put("questionContent", q.getContent());
                    uaMap.put("optionA", q.getOptionA());
                    uaMap.put("optionB", q.getOptionB());
                    uaMap.put("optionC", q.getOptionC());
                    uaMap.put("optionD", q.getOptionD());
                    uaMap.put("correctAnswer", q.getCorrectAnswer());
                    uaMap.put("marks", q.getMarks());
                }
                answersList.add(uaMap);
            }
        }
        map.put("userAnswers", answersList);
        return map;
    }
}
