package com.oep.online_examination_portal.controller;

import com.oep.online_examination_portal.entity.Question;
import com.oep.online_examination_portal.entity.Quiz;
import com.oep.online_examination_portal.service.QuestionService;
import com.oep.online_examination_portal.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class QuestionController {

    private final QuestionService questionService;
    private final QuizService quizService;

    @Autowired
    public QuestionController(QuestionService questionService, QuizService quizService) {
        this.questionService = questionService;
        this.quizService = quizService;
    }

    @GetMapping("/teacher/quizzes/{quizId}/questions")
    public String manageQuestions(@PathVariable Long quizId, Model model) {
        Quiz quiz = quizService.findQuizById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid quiz Id:" + quizId));
        model.addAttribute("quiz", quiz);
        model.addAttribute("questions", questionService.getQuestionsForQuiz(quizId));
        model.addAttribute("newQuestion", new Question());
        return "manage-questions";
    }

    @PostMapping("/teacher/quizzes/{quizId}/questions/add")
    public String addQuestion(@PathVariable Long quizId, @ModelAttribute Question question) {
        questionService.addQuestion(quizId, question);
        return "redirect:/teacher/quizzes/" + quizId + "/questions?success_add";
    }

    @GetMapping("/teacher/questions/edit/{id}")
    public String editQuestionForm(@PathVariable Long id, Model model) {
        Question question = questionService.findQuestionById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid question Id:" + id));
        model.addAttribute("question", question);
        return "manage-questions-edit";
    }

    @PostMapping("/teacher/questions/edit/{id}")
    public String editQuestionSubmit(@PathVariable Long id, @ModelAttribute Question question) {
        Question existing = questionService.findQuestionById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid question Id:" + id));
        questionService.updateQuestion(id, question);
        return "redirect:/teacher/quizzes/" + existing.getQuiz().getId() + "/questions?success_update";
    }

    @GetMapping("/teacher/questions/delete/{id}")
    public String deleteQuestion(@PathVariable Long id) {
        Question question = questionService.findQuestionById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid question Id:" + id));
        Long quizId = question.getQuiz().getId();
        questionService.deleteQuestion(id);
        return "redirect:/teacher/quizzes/" + quizId + "/questions?success_delete";
    }
}
