
package com.campusmarketplace.campus_marketplace.service;

import com.campusmarketplace.campus_marketplace.entity.User;
import com.campusmarketplace.campus_marketplace.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user) {

        if (user.getName() == null || user.getName().isBlank()) {
            throw new RuntimeException("Name is required");
        }

        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new RuntimeException("Email is required");
        }

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new RuntimeException("Password is required");
        }

        if (userRepository.existsByEmail(user.getEmail().trim())) {
            throw new RuntimeException("Email already registered");
        }

        user.setEmail(user.getEmail().trim().toLowerCase());

        // Never allow public registration as ADMIN.
        String requestedRole = user.getRole();

        if (requestedRole == null || requestedRole.isBlank()) {
            user.setRole("BUYER");
        } else {
            String role = requestedRole.trim().toUpperCase();

            if (!role.equals("BUYER") && !role.equals("SELLER")) {
                throw new RuntimeException(
                    "Invalid role. Choose BUYER or SELLER."
                );
            }

            user.setRole(role);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    public User loginUser(String email, String password) {

        if (email == null || email.isBlank()
                || password == null || password.isBlank()) {
            throw new RuntimeException("Email and password are required");
        }

        User user = userRepository
                .findByEmail(email.trim().toLowerCase())
                .orElseThrow(() ->
                    new RuntimeException("Invalid email or password")
                );

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return user;
    }
}
