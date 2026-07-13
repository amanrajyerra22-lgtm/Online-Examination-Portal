package com.oep.online_examination_portal.service;

import com.oep.online_examination_portal.entity.Quiz;
import com.oep.online_examination_portal.entity.User;

import java.util.List;
import java.util.Optional;

public interface QuizService {
    Quiz createQuiz(Quiz quiz, User creator);
    Quiz updateQuiz(Long id, Quiz quizDetails);
    void deleteQuiz(Long id);
    Optional<Quiz> findQuizById(Long id);
    List<Quiz> getAllQuizzes();
    List<Quiz> getQuizzesByCreator(User creator);
}
