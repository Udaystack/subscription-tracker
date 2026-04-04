package com.subscriptiontracker.dto;

import com.subscriptiontracker.model.Subscription.BillingCycle;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class SubscriptionDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        @NotBlank(message = "Name is required")
        private String name;

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be positive")
        private BigDecimal amount;

        @NotBlank(message = "Currency is required")
        private String currency;

        @NotNull(message = "Billing cycle is required")
        private BillingCycle billingCycle;

        @NotNull(message = "Next renewal date is required")
        private LocalDate nextRenewalDate;

        private String category;
        private String notes;
        private String logoUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String name;
        private BigDecimal amount;
        private String currency;
        private BillingCycle billingCycle;
        private LocalDate nextRenewalDate;
        private String category;
        private String notes;
        private String logoUrl;
        private boolean active;
        private long daysUntilRenewal;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Summary {
        private BigDecimal totalMonthly;
        private BigDecimal totalYearly;
        private long activeCount;
        private long dueSoonCount;
        private String currency;
    }
}
