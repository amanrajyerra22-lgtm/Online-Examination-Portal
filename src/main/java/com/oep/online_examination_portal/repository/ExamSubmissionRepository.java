package com.oep.online_examination_portal.repository;

import com.oep.online_examination_portal.entity.ExamSubmission;
import com.oep.online_examination_portal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamSubmissionRepository extends JpaRepository<ExamSubmission, Long> {
    List<ExamSubmission> findByStudent(User student);
    List<ExamSubmission> findByStudentId(Long studentId);
    List<ExamSubmission> findByQuizId(Long quizId);
    java.util.Optional<ExamSubmission> findFirstByStudentIdAndQuizId(Long studentId, Long quizId);
}
