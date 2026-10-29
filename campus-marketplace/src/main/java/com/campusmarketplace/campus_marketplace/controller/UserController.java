
package com.campusmarketplace.campus_marketplace.controller;

import com.campusmarketplace.campus_marketplace.entity.User;
import com.campusmarketplace.campus_marketplace.service.UserService;
import com.campusmarketplace.campus_marketplace.dto.UserResponse;
import com.campusmarketplace.campus_marketplace.dto.LoginRequest;

import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(
    origins = "http://localhost:5173",
    allowCredentials = "true"
)
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final SecurityContextRepository contextRepository;

    public UserController(
            UserService userService,
            SecurityContextRepository contextRepository) {
        this.userService = userService;
        this.contextRepository = contextRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User savedUser = userService.registerUser(user);
            return ResponseEntity.ok(toResponse(savedUser));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(
        @RequestBody LoginRequest loginRequest,
        HttpServletRequest request,
        HttpServletResponse response,
        HttpSession session) {

        try {
            User user = userService.loginUser(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            );

            String role = user.getRole() == null
                ? "BUYER"
                : user.getRole().trim().toUpperCase();

            if (!List.of("BUYER", "SELLER", "ADMIN").contains(role)) {
                return ResponseEntity.status(403)
                    .body("Account has an invalid role");
            }

            var authentication =
                new UsernamePasswordAuthenticationToken(
                    user.getEmail(),
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + role))
                );

            SecurityContext context =
                SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            contextRepository.saveContext(context, request, response);

            return ResponseEntity.ok(toResponse(user));

        } catch (RuntimeException e) {
            SecurityContextHolder.clearContext();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        SecurityContextHolder.clearContext();
        session.invalidate();
        return ResponseEntity.ok("Logged out successfully");
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole()
        );
    }
}
