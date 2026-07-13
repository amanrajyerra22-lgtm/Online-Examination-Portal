package com.oep.online_examination_portal.service;

import com.oep.online_examination_portal.entity.ExamSubmission;
import com.oep.online_examination_portal.entity.Quiz;
import com.oep.online_examination_portal.entity.User;
import com.oep.online_examination_portal.repository.ExamSubmissionRepository;
import com.oep.online_examination_portal.repository.QuizRepository;
import com.oep.online_examination_portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final QuizRepository quizRepository;
    private final ExamSubmissionRepository submissionRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, 
                           PasswordEncoder passwordEncoder,
                           QuizRepository quizRepository,
                           ExamSubmissionRepository submissionRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.quizRepository = quizRepository;
        this.submissionRepository = submissionRepository;
    }

    @Override
    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email is already registered: " + user.getEmail());
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Override
    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public Optional<User> findUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        // 1. Delete submissions by this student (which deletes associated UserAnswers due to JPA cascade)
        List<ExamSubmission> studentSubmissions = submissionRepository.findByStudentId(id);
        for (ExamSubmission sub : studentSubmissions) {
            submissionRepository.delete(sub);
        }

        // 2. Delete quizzes created by this user
        List<Quiz> quizzes = quizRepository.findByCreatedBy(user);
        for (Quiz quiz : quizzes) {
            // Delete all student submissions of this quiz first (violates FK if we delete quiz directly)
            List<ExamSubmission> quizSubmissions = submissionRepository.findByQuizId(quiz.getId());
            for (ExamSubmission sub : quizSubmissions) {
                submissionRepository.delete(sub);
            }
            // Delete the quiz itself (which deletes associated Questions due to JPA cascade)
            quizRepository.delete(quiz);
        }

        // 3. Finally delete the user
        userRepository.delete(user);
    }
}
