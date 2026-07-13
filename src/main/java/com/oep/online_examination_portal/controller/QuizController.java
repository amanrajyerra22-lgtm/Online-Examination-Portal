package com.oep.online_examination_portal.controller;

import com.oep.online_examination_portal.entity.Quiz;
import com.oep.online_examination_portal.entity.User;
import com.oep.online_examination_portal.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class QuizController {

    private final QuizService quizService;

    @Autowired
    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    // Student view of quizzes
    @GetMapping("/quizzes")
    public String listQuizzes(Model model) {
        model.addAttribute("quizzes", quizService.getAllQuizzes());
        return "quiz-list";
    }

    // Teacher view of quizzes
    @GetMapping("/teacher/quizzes")
    public String manageQuizzes(@AuthenticationPrincipal User user, Model model) {
        if (user == null) {
            return "redirect:/login";
        }
        List<Quiz> quizzes = quizService.getQuizzesByCreator(user);
        model.addAttribute("quizzes", quizzes);
        return "manage-quizzes";
    }

    @GetMapping("/teacher/quizzes/create")
    public String createQuizForm(Model model) {
        model.addAttribute("quiz", new Quiz());
        return "manage-quizzes-form";
    }

    @PostMapping("/teacher/quizzes/create")
    public String createQuizSubmit(@AuthenticationPrincipal User user, @ModelAttribute Quiz quiz) {
        if (user == null) {
            return "redirect:/login";
        }
        quizService.createQuiz(quiz, user);
        return "redirect:/teacher/quizzes?success_create";
    }

    @GetMapping("/teacher/quizzes/edit/{id}")
    public String editQuizForm(@PathVariable Long id, Model model) {
        Quiz quiz = quizService.findQuizById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid quiz Id:" + id));
        model.addAttribute("quiz", quiz);
        return "manage-quizzes-form";
    }

    @PostMapping("/teacher/quizzes/edit/{id}")
    public String editQuizSubmit(@PathVariable Long id, @ModelAttribute Quiz quiz) {
        quizService.updateQuiz(id, quiz);
        return "redirect:/teacher/quizzes?success_update";
    }

    @GetMapping("/teacher/quizzes/delete/{id}")
    public String deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return "redirect:/teacher/quizzes?success_delete";
    }
}
