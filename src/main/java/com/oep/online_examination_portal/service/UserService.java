package com.oep.online_examination_portal.service;

import com.oep.online_examination_portal.entity.User;

import java.util.Optional;

public interface UserService {
    User registerUser(User user);
    Optional<User> findUserByEmail(String email);
    Optional<User> findUserById(Long id);
    void deleteUser(Long id);
}
