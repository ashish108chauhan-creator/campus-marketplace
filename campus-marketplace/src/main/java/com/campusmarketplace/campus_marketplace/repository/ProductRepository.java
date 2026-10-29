package com.campusmarketplace.campus_marketplace.repository;

import com.campusmarketplace.campus_marketplace.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategoryIgnoreCase(String category);

    List<Product> findByConditionIgnoreCase(String condition);

    List<Product> findByPriceLessThanEqual(Double maxPrice);

    List<Product> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String title,
            String description
    );

    @Query("""
        SELECT p FROM Product p
        WHERE (:category IS NULL OR LOWER(p.category) = LOWER(:category))
        AND (:condition IS NULL OR LOWER(p.condition) = LOWER(:condition))
        AND (:maxPrice IS NULL OR p.price <= :maxPrice)
        AND (
            :search IS NULL
            OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))
        )
    """)
    List<Product> searchProducts(
            @Param("category") String category,
            @Param("condition") String condition,
            @Param("maxPrice") Double maxPrice,
            @Param("search") String search
    );
    List<Product> findBySeller_Id(Long sellerId);
}