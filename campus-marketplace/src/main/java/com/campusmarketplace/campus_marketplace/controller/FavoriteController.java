package com.campusmarketplace.campus_marketplace.controller;

import com.campusmarketplace.campus_marketplace.service.FavoriteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @PostMapping
    public ResponseEntity<?> addFavorite(
            @RequestParam Long userId,
            @RequestParam Long productId) {

        try {
            return ResponseEntity.ok(
                    favoriteService.addFavorite(userId, productId)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getFavorites(
            @RequestParam Long userId) {

        try {
            return ResponseEntity.ok(
                    favoriteService.getUserFavorites(userId)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping
    public ResponseEntity<?> removeFavorite(
            @RequestParam Long userId,
            @RequestParam Long productId) {

        try {
            favoriteService.removeFavorite(userId, productId);

            return ResponseEntity.ok("Favorite removed successfully");

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}