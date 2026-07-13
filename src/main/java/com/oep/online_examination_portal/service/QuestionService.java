package com.oep.online_examination_portal.service;

import com.oep.online_examination_portal.entity.Question;

import java.util.List;
import java.util.Optional;

public interface QuestionService {
    Question addQuestion(Long quizId, Question question);
    Question updateQuestion(Long questionId, Question questionDetails);
    void deleteQuestion(Long questionId);
    List<Question> getQuestionsForQuiz(Long quizId);
    Optional<Question> findQuestionById(Long questionId);
}
