package com.oep.online_examination_portal.controller.api;

import com.oep.online_examination_portal.entity.Question;
import com.oep.online_examination_portal.service.QuestionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teacher")
public class ApiQuestionController {

    private final QuestionService questionService;

    public ApiQuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    // Get list of questions in a quiz
    @GetMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<List<Map<String, Object>>> getQuizQuestions(@PathVariable Long quizId) {
        List<Question> questions = questionService.getQuestionsForQuiz(quizId);
        List<Map<String, Object>> response = questions.stream()
                .map(this::mapQuestionResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // Add a new question to a quiz
    @PostMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<?> addQuestion(@PathVariable Long quizId, @RequestBody Question question) {
        try {
            Question created = questionService.addQuestion(quizId, question);
            return ResponseEntity.status(HttpStatus.CREATED).body(mapQuestionResponse(created));
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    // Edit an existing question
    @PutMapping("/questions/{id}")
    public ResponseEntity<?> updateQuestion(@PathVariable Long id, @RequestBody Question questionDetails) {
        try {
            Question updated = questionService.updateQuestion(id, questionDetails);
            return ResponseEntity.ok(mapQuestionResponse(updated));
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    // Delete a question
    @DeleteMapping("/questions/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        try {
            questionService.deleteQuestion(id);
            Map<String, String> msg = new HashMap<>();
            msg.put("message", "Question deleted successfully");
            return ResponseEntity.ok(msg);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    private Map<String, Object> mapQuestionResponse(Question q) {
        Map<String, Object> qMap = new HashMap<>();
        qMap.put("id", q.getId());
        qMap.put("content", q.getContent());
        qMap.put("optionA", q.getOptionA());
        qMap.put("optionB", q.getOptionB());
        qMap.put("optionC", q.getOptionC());
        qMap.put("optionD", q.getOptionD());
        qMap.put("correctAnswer", q.getCorrectAnswer());
        qMap.put("marks", q.getMarks());
        if (q.getQuiz() != null) {
            qMap.put("quizId", q.getQuiz().getId());
        }
        return qMap;
    }
}
