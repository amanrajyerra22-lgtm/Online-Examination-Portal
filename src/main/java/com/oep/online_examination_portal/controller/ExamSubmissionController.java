package com.oep.online_examination_portal.controller;

import com.oep.online_examination_portal.entity.ExamSubmission;
import com.oep.online_examination_portal.entity.Quiz;
import com.oep.online_examination_portal.entity.User;
import com.oep.online_examination_portal.service.ExamSubmissionService;
import com.oep.online_examination_portal.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class ExamSubmissionController {

    private final ExamSubmissionService examSubmissionService;
    private final QuizService quizService;

    @Autowired
    public ExamSubmissionController(ExamSubmissionService examSubmissionService, QuizService quizService) {
        this.examSubmissionService = examSubmissionService;
        this.quizService = quizService;
    }

    @GetMapping("/quizzes/{id}/take")
    public String takeQuiz(@PathVariable Long id, @AuthenticationPrincipal User user, Model model) {
        if (user == null) {
            return "redirect:/login";
        }
        Quiz quiz = quizService.findQuizById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid quiz Id:" + id));

        if (quiz.getQuestions().isEmpty()) {
            return "redirect:/quizzes?error_no_questions";
        }

        model.addAttribute("quiz", quiz);
        return "take-quiz";
    }

    @PostMapping("/quizzes/{id}/submit")
    public String submitQuiz(@PathVariable Long id,
                             @AuthenticationPrincipal User user,
                             @RequestParam Map<String, String> allParams) {
        if (user == null) {
            return "redirect:/login";
        }

        Map<Long, String> answers = new HashMap<>();
        for (Map.Entry<String, String> entry : allParams.entrySet()) {
            if (entry.getKey().startsWith("question_")) {
                try {
                    Long questionId = Long.parseLong(entry.getKey().substring(9));
                    answers.put(questionId, entry.getValue());
                } catch (NumberFormatException ignored) {}
            }
        }

        ExamSubmission submission = examSubmissionService.submitExam(id, user, answers);
        return "redirect:/submissions/" + submission.getId();
    }

    @GetMapping("/submissions/{id}")
    public String viewSubmission(@PathVariable Long id, @AuthenticationPrincipal User user, Model model) {
        if (user == null) {
            return "redirect:/login";
        }
        ExamSubmission submission = examSubmissionService.findSubmissionById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid submission Id:" + id));

        // Security check: Only the student who submitted or a teacher can view this
        if (!submission.getStudent().getId().equals(user.getId()) && !user.getRole().name().equals("TEACHER")) {
            return "redirect:/dashboard?error_unauthorized";
        }

        model.addAttribute("submission", submission);
        return "quiz-result";
    }

    @GetMapping("/history")
    public String examHistory(@AuthenticationPrincipal User user, Model model) {
        if (user == null) {
            return "redirect:/login";
        }
        List<ExamSubmission> submissions = examSubmissionService.getSubmissionsByStudent(user);
        model.addAttribute("submissions", submissions);
        model.addAttribute("currentUser", user);
        return "submissions-list";
    }

    @GetMapping("/teacher/submissions")
    public String listAllSubmissions(@AuthenticationPrincipal User user, Model model) {
        if (user == null) {
            return "redirect:/login";
        }
        List<ExamSubmission> submissions = examSubmissionService.getAllSubmissions();
        model.addAttribute("submissions", submissions);
        model.addAttribute("currentUser", user);
        return "submissions-list";
    }
}
