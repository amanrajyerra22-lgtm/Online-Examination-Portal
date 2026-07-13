package com.oep.online_examination_portal.service;

import com.oep.online_examination_portal.entity.*;
import com.oep.online_examination_portal.repository.ExamSubmissionRepository;
import com.oep.online_examination_portal.repository.QuizRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class ExamSubmissionServiceTest {

    @Mock
    private ExamSubmissionRepository submissionRepository;

    @Mock
    private QuizRepository quizRepository;

    @InjectMocks
    private ExamSubmissionServiceImpl examSubmissionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSubmitExam_CalculatesCorrectScore() {
        // Arrange
        User student = User.builder().id(1L).email("student@test.com").role(Role.STUDENT).build();
        
        Quiz quiz = Quiz.builder()
                .id(1L)
                .title("Basic Java")
                .passPercentage(60.0)
                .questions(new ArrayList<>())
                .build();

        Question q1 = Question.builder().id(10L).content("Q1").correctAnswer("A").quiz(quiz).build();
        Question q2 = Question.builder().id(11L).content("Q2").correctAnswer("B").quiz(quiz).build();
        
        quiz.getQuestions().add(q1);
        quiz.getQuestions().add(q2);

        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(submissionRepository.save(any(ExamSubmission.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<Long, String> answers = new HashMap<>();
        answers.put(10L, "A"); // correct
        answers.put(11L, "A"); // incorrect

        // Act
        ExamSubmission submission = examSubmissionService.submitExam(1L, student, answers);

        // Assert
        assertNotNull(submission);
        assertEquals(2, submission.getTotalQuestions());
        assertEquals(1, submission.getCorrectAnswers());
        assertEquals(50.0, submission.getScore());
        assertFalse(submission.isPassed());
    }

    @Test
    void testSubmitExam_PassingGrade() {
        // Arrange
        User student = User.builder().id(1L).email("student@test.com").role(Role.STUDENT).build();
        
        Quiz quiz = Quiz.builder()
                .id(1L)
                .title("Basic Java")
                .passPercentage(50.0)
                .questions(new ArrayList<>())
                .build();

        Question q1 = Question.builder().id(10L).content("Q1").correctAnswer("A").quiz(quiz).build();
        Question q2 = Question.builder().id(11L).content("Q2").correctAnswer("B").quiz(quiz).build();
        
        quiz.getQuestions().add(q1);
        quiz.getQuestions().add(q2);

        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(submissionRepository.save(any(ExamSubmission.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<Long, String> answers = new HashMap<>();
        answers.put(10L, "A"); // correct
        answers.put(11L, "B"); // correct

        // Act
        ExamSubmission submission = examSubmissionService.submitExam(1L, student, answers);

        // Assert
        assertNotNull(submission);
        assertEquals(2, submission.getTotalQuestions());
        assertEquals(2, submission.getCorrectAnswers());
        assertEquals(100.0, submission.getScore());
        assertTrue(submission.isPassed());
    }
}
