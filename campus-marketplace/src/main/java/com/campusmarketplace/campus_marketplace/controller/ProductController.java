package com.campusmarketplace.campus_marketplace.controller;

import com.campusmarketplace.campus_marketplace.entity.Product;
import com.campusmarketplace.campus_marketplace.service.ProductService;
import com.campusmarketplace.campus_marketplace.dto.ProductResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<?> createProduct(
            @RequestBody Product product,
            @RequestParam Long sellerId) {

        try {
            Product savedProduct = productService.createProduct(product, sellerId);

            ProductResponse response = new ProductResponse(
        savedProduct.getId(),
        savedProduct.getTitle(),
        savedProduct.getDescription(),
        savedProduct.getPrice(),
        savedProduct.getCategory(),
        savedProduct.getCondition(),
        savedProduct.getImageUrl(),
        savedProduct.getCreatedAt() != null
                ? savedProduct.getCreatedAt().toString()
                : null,
        savedProduct.getSeller().getId(),
        savedProduct.getSeller().getName(),
        savedProduct.getSeller().getEmail(),
        savedProduct.getSeller().getPhone()
);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String condition,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String search) {

        List<Product> products;

        products = productService.searchProducts(
                category,
                condition,
                maxPrice,
                search
        );

        List<ProductResponse> responses = products.stream()
                .map(product -> new ProductResponse(
                        product.getId(),
                        product.getTitle(),
                        product.getDescription(),
                        product.getPrice(),
                        product.getCategory(),
                        product.getCondition(),
                        product.getImageUrl(),
                        product.getCreatedAt() != null
                                ? product.getCreatedAt().toString()
                                : null,
                        product.getSeller().getId(),
                        product.getSeller().getName(),
                        product.getSeller().getEmail(),
                        product.getSeller().getPhone()
                ))
                .toList();

        return ResponseEntity.ok(responses);
    }
    @PutMapping("/{productId}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long productId,
            @RequestParam Long sellerId,
            @RequestBody Product product) {

        try {
            Product updatedProduct =
                    productService.updateProduct(productId, product, sellerId);

            ProductResponse response = new ProductResponse(
            updatedProduct.getId(),
            updatedProduct.getTitle(),
            updatedProduct.getDescription(),
            updatedProduct.getPrice(),
            updatedProduct.getCategory(),
            updatedProduct.getCondition(),
            updatedProduct.getImageUrl(),
            updatedProduct.getCreatedAt() != null
                    ?updatedProduct.getCreatedAt().toString()
                    : null,
            updatedProduct.getSeller().getId(),
            updatedProduct.getSeller().getName(),
            updatedProduct.getSeller().getEmail(),
            updatedProduct.getSeller().getPhone()
    );

return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @DeleteMapping("/{productId}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable Long productId,
            @RequestParam Long sellerId) {

        try {
            productService.deleteProduct(productId, sellerId);

            return ResponseEntity.ok("Product deleted successfully");

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}