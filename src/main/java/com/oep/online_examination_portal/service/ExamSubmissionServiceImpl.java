package com.oep.online_examination_portal.service;

import com.oep.online_examination_portal.entity.ExamSubmission;
import com.oep.online_examination_portal.entity.Question;
import com.oep.online_examination_portal.entity.Quiz;
import com.oep.online_examination_portal.entity.User;
import com.oep.online_examination_portal.entity.UserAnswer;
import com.oep.online_examination_portal.repository.ExamSubmissionRepository;
import com.oep.online_examination_portal.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class ExamSubmissionServiceImpl implements ExamSubmissionService {

    private final ExamSubmissionRepository submissionRepository;
    private final QuizRepository quizRepository;

    @Autowired
    public ExamSubmissionServiceImpl(ExamSubmissionRepository submissionRepository, QuizRepository quizRepository) {
        this.submissionRepository = submissionRepository;
        this.quizRepository = quizRepository;
    }

    @Override
    public ExamSubmission submitExam(Long quizId, User student, Map<Long, String> questionIdToAnswers) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found with id: " + quizId));

        Optional<ExamSubmission> existing = submissionRepository.findFirstByStudentIdAndQuizId(student.getId(), quizId);
        if (existing.isPresent()) {
            throw new IllegalStateException("You have already submitted an attempt for this quiz.");
        }

        List<Question> questions = quiz.getQuestions();
        int totalQuestions = questions.size();
        int correctAnswers = 0;

        List<UserAnswer> userAnswers = new ArrayList<>();

        ExamSubmission submission = ExamSubmission.builder()
                .student(student)
                .quiz(quiz)
                .totalQuestions(totalQuestions)
                .submissionDate(LocalDateTime.now())
                .build();

        double totalMarks = 0.0;
        double earnedMarks = 0.0;

        for (Question question : questions) {
            String selected = questionIdToAnswers.get(question.getId());
            if (selected == null) {
                selected = "";
            }
            selected = selected.trim();

            boolean isCorrect = selected.equalsIgnoreCase(question.getCorrectAnswer().trim());
            if (isCorrect) {
                correctAnswers++;
                earnedMarks += question.getMarks();
            }
            totalMarks += question.getMarks();

            UserAnswer userAnswer = UserAnswer.builder()
                    .submission(submission)
                    .question(question)
                    .selectedAnswer(selected)
                    .isCorrect(isCorrect)
                    .build();

            userAnswers.add(userAnswer);
        }

        double score = totalMarks > 0 ? (earnedMarks / totalMarks) * 100.0 : 0.0;
        boolean passed = score >= quiz.getPassPercentage();

        submission.setScore(score);
        submission.setCorrectAnswers(correctAnswers);
        submission.setPassed(passed);
        submission.setUserAnswers(userAnswers);

        return submissionRepository.save(submission);
    }

    @Override
    public Optional<ExamSubmission> findSubmissionById(Long submissionId) {
        return submissionRepository.findById(submissionId);
    }

    @Override
    public List<ExamSubmission> getSubmissionsByStudent(User student) {
        return submissionRepository.findByStudent(student);
    }

    @Override
    public List<ExamSubmission> getSubmissionsByQuiz(Long quizId) {
        return submissionRepository.findByQuizId(quizId);
    }

    @Override
    public List<ExamSubmission> getAllSubmissions() {
        return submissionRepository.findAll();
    }
}
