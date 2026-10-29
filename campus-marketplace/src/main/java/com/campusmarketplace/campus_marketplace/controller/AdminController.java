
package com.campusmarketplace.campus_marketplace.controller;

import com.campusmarketplace.campus_marketplace.entity.Product;
import com.campusmarketplace.campus_marketplace.entity.User;
import com.campusmarketplace.campus_marketplace.repository.ProductRepository;
import com.campusmarketplace.campus_marketplace.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(
    origins = "http://localhost:5173",
    allowCredentials = "true"
)
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public AdminController(
            UserRepository userRepository,
            ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    // DASHBOARD STATISTICS
    @GetMapping("/stats")
    public java.util.Map<String, Long> getStats() {
        return java.util.Map.of(
            "totalUsers", userRepository.count(),
            "totalProducts", productRepository.count()
        );
    }

    // GET ALL USERS (WITHOUT PASSWORDS)
    @GetMapping("/users")
    public List<UserAdminResponse> getAllUsers() {
        return userRepository.findAll()
            .stream()
            .map(user -> new UserAdminResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole()
            ))
            .toList();
    }

    // DELETE A USER
    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long id,
            Authentication authentication) {

        User user = userRepository.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // Prevent deleting the currently logged-in admin.
        if (user.getEmail().equalsIgnoreCase(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("You cannot delete your own account.");
        }

        // Prevent deleting another admin through user management.
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Admin accounts cannot be deleted here.");
        }

        // Remove the seller's products before deleting the user.
        List<Product> sellerProducts =
            productRepository.findBySeller_Id(id);

        productRepository.deleteAll(sellerProducts);
        userRepository.delete(user);

        return ResponseEntity.ok("User deleted successfully.");
    }

    // GET ALL PRODUCTS
    @GetMapping("/products")
    public List<ProductAdminResponse> getAllProducts() {
        return productRepository.findAll()
            .stream()
            .map(product -> new ProductAdminResponse(
                product.getId(),
                product.getTitle(),
                product.getDescription(),
                product.getPrice(),
                product.getCategory(),
                product.getCondition(),
                product.getImageUrl(),
                product.getCreatedAt(),
                product.getSeller() != null
                    ? product.getSeller().getName() : "Unknown",
                product.getSeller() != null
                    ? product.getSeller().getEmail() : "Unknown"
            ))
            .toList();
    }

    // DELETE ANY PRODUCT
    @DeleteMapping("/products/{id}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable Long id) {

        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        productRepository.deleteById(id);

        return ResponseEntity.ok("Product removed successfully.");
    }

    // SAFE USER RESPONSE
    public record UserAdminResponse(
        Long id,
        String name,
        String email,
        String phone,
        String role
    ) {}

    // SAFE PRODUCT RESPONSE
    public record ProductAdminResponse(
        Long id,
        String title,
        String description,
        Double price,
        String category,
        String condition,
        String imageUrl,
        java.time.LocalDateTime createdAt,
        String sellerName,
        String sellerEmail
    ) {}
}
