package com.campusmarketplace.campus_marketplace.dto;

public class ProductResponse {

    private Long id;
    private String title;
    private String description;
    private Double price;
    private String category;
    private String condition;
    private String imageUrl;
    private String createdAt;

    private Long sellerId;
    private String sellerName;
    private String sellerEmail;
    private String sellerPhone;

    public ProductResponse(
            Long id,
            String title,
            String description,
            Double price,
            String category,
            String condition,
            String imageUrl,
            String createdAt,
            Long sellerId,
            String sellerName,
            String sellerEmail,
            String sellerPhone) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.category = category;
        this.condition = condition;
        this.imageUrl = imageUrl;
        this.createdAt = createdAt;
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        this.sellerEmail = sellerEmail;
        this.sellerPhone = sellerPhone;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Double getPrice() {
        return price;
    }

    public String getCategory() {
        return category;
    }

    public String getCondition() {
        return condition;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public Long getSellerId() {
        return sellerId;
    }

    public String getSellerName() {
        return sellerName;
    }

    public String getSellerEmail() {
        return sellerEmail;
    }

    public String getSellerPhone() {
        return sellerPhone;
    }
}