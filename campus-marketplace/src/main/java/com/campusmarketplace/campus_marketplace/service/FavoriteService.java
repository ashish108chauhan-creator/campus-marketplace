package com.campusmarketplace.campus_marketplace.service;

import com.campusmarketplace.campus_marketplace.entity.Favorite;
import com.campusmarketplace.campus_marketplace.entity.Product;
import com.campusmarketplace.campus_marketplace.entity.User;
import com.campusmarketplace.campus_marketplace.repository.FavoriteRepository;
import com.campusmarketplace.campus_marketplace.repository.ProductRepository;
import com.campusmarketplace.campus_marketplace.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public FavoriteService(
            FavoriteRepository favoriteRepository,
            UserRepository userRepository,
            ProductRepository productRepository) {

        this.favoriteRepository = favoriteRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public Favorite addFavorite(Long userId, Long productId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (favoriteRepository.findByUserIdAndProductId(userId, productId).isPresent()) {
            throw new RuntimeException("Product already added to favorites");
        }

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setProduct(product);

        return favoriteRepository.save(favorite);
    }

    public List<Favorite> getUserFavorites(Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }

        return favoriteRepository.findByUserId(userId);
    }

    public void removeFavorite(Long userId, Long productId) {

        Favorite favorite = favoriteRepository
                .findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new RuntimeException("Favorite not found"));

        favoriteRepository.delete(favorite);
    }
}