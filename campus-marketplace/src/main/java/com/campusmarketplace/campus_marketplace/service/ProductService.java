package com.campusmarketplace.campus_marketplace.service;

import com.campusmarketplace.campus_marketplace.entity.Product;
import com.campusmarketplace.campus_marketplace.entity.User;
import com.campusmarketplace.campus_marketplace.repository.ProductRepository;
import com.campusmarketplace.campus_marketplace.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ProductService(ProductRepository productRepository,
                           UserRepository userRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public Product createProduct(Product product, Long sellerId) {

        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        product.setSeller(seller);

        product.setCreatedAt(java.time.LocalDateTime.now());

        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryIgnoreCase(category);
    }

    public List<Product> getProductsByCondition(String condition) {
        return productRepository.findByConditionIgnoreCase(condition);
    }

    public List<Product> getProductsByMaxPrice(Double maxPrice) {
        return productRepository.findByPriceLessThanEqual(maxPrice);
    }

    public List<Product> searchProducts(String search) {
        return productRepository
                .findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                        search,
                        search
                );
    }
    public List<Product> searchProducts(
            String category,
            String condition,
            Double maxPrice,
            String search) {

        return productRepository.searchProducts(
                category,
                condition,
                maxPrice,
                search
        );
    }
    public Product updateProduct(Long productId, Product updatedProduct, Long sellerId) {

        Product existingProduct = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!existingProduct.getSeller().getId().equals(sellerId)) {
            throw new RuntimeException("You can update only your own products");
        }

         existingProduct.setTitle(updatedProduct.getTitle());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setCategory(updatedProduct.getCategory());
        existingProduct.setCondition(updatedProduct.getCondition());
        existingProduct.setImageUrl(updatedProduct.getImageUrl());

        return productRepository.save(existingProduct);
    }


    public void deleteProduct(Long productId, Long sellerId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new RuntimeException("You can delete only your own products");
        }

        productRepository.delete(product);
    }
}