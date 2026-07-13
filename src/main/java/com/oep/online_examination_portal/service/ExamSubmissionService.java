package com.oep.online_examination_portal.service;

import com.oep.online_examination_portal.entity.ExamSubmission;
import com.oep.online_examination_portal.entity.User;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ExamSubmissionService {
    ExamSubmission submitExam(Long quizId, User student, Map<Long, String> questionIdToAnswers);
    Optional<ExamSubmission> findSubmissionById(Long submissionId);
    List<ExamSubmission> getSubmissionsByStudent(User student);
    List<ExamSubmission> getSubmissionsByQuiz(Long quizId);
    List<ExamSubmission> getAllSubmissions();
}
