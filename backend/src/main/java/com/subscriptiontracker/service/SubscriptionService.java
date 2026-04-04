package com.subscriptiontracker.service;

import com.subscriptiontracker.dto.SubscriptionDTO;
import com.subscriptiontracker.model.Subscription;
import com.subscriptiontracker.model.Subscription.BillingCycle;
import com.subscriptiontracker.model.User;
import com.subscriptiontracker.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final SnsNotificationService snsService;

    @Transactional
    public SubscriptionDTO.Response createSubscription(SubscriptionDTO.Request request, User user) {
        Subscription subscription = Subscription.builder()
                .name(request.getName())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .billingCycle(request.getBillingCycle())
                .nextRenewalDate(request.getNextRenewalDate())
                .category(request.getCategory())
                .notes(request.getNotes())
                .logoUrl(request.getLogoUrl())
                .active(true)
                .user(user)
                .build();

        Subscription saved = subscriptionRepository.save(subscription);
        log.info("Created subscription {} for user {}", saved.getId(), user.getEmail());
        return toResponse(saved);
    }

    public List<SubscriptionDTO.Response> getSubscriptions(User user) {
        return subscriptionRepository.findByUserAndActiveTrue(user)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public SubscriptionDTO.Response getSubscription(Long id, User user) {
        return subscriptionRepository.findById(id)
                .filter(s -> s.getUser().getId().equals(user.getId()))
                .map(this::toResponse)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
    }

    @Transactional
    public SubscriptionDTO.Response updateSubscription(Long id, SubscriptionDTO.Request request, User user) {
        Subscription subscription = subscriptionRepository.findById(id)
                .filter(s -> s.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Subscription not found"));

        subscription.setName(request.getName());
        subscription.setAmount(request.getAmount());
        subscription.setCurrency(request.getCurrency());
        subscription.setBillingCycle(request.getBillingCycle());
        subscription.setNextRenewalDate(request.getNextRenewalDate());
        subscription.setCategory(request.getCategory());
        subscription.setNotes(request.getNotes());
        subscription.setLogoUrl(request.getLogoUrl());

        return toResponse(subscriptionRepository.save(subscription));
    }

    @Transactional
    public void deleteSubscription(Long id, User user) {
        Subscription subscription = subscriptionRepository.findById(id)
                .filter(s -> s.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        subscription.setActive(false);
        subscriptionRepository.save(subscription);
    }

    public SubscriptionDTO.Summary getSummary(User user) {
        List<Subscription> active = subscriptionRepository.findByUserAndActiveTrue(user);

        BigDecimal totalMonthly = active.stream()
                .map(s -> toMonthlyAmount(s.getAmount(), s.getBillingCycle()))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        LocalDate now = LocalDate.now();
        long dueSoon = active.stream()
                .filter(s -> {
                    long days = ChronoUnit.DAYS.between(now, s.getNextRenewalDate());
                    return days >= 0 && days <= 7;
                })
                .count();

        return SubscriptionDTO.Summary.builder()
                .totalMonthly(totalMonthly)
                .totalYearly(totalMonthly.multiply(BigDecimal.valueOf(12)).setScale(2, RoundingMode.HALF_UP))
                .activeCount(active.size())
                .dueSoonCount(dueSoon)
                .currency("USD")
                .build();
    }

    // Scheduled: called daily to check renewals and publish to SNS
    @Transactional
    public void checkAndNotifyRenewals() {
        LocalDate today = LocalDate.now();
        LocalDate checkUntil = today.plusDays(7);

        List<Subscription> upcoming = subscriptionRepository.findRenewingBetween(today, checkUntil);
        log.info("Found {} subscriptions renewing in next 7 days", upcoming.size());

        for (Subscription sub : upcoming) {
            long daysUntil = ChronoUnit.DAYS.between(today, sub.getNextRenewalDate());
            if (sub.getUser().isEmailNotifications() &&
                daysUntil <= sub.getUser().getReminderDaysBefore()) {
                snsService.publishRenewalAlert(sub, daysUntil);
            }
        }
    }

    private BigDecimal toMonthlyAmount(BigDecimal amount, BillingCycle cycle) {
        return switch (cycle) {
            case WEEKLY -> amount.multiply(BigDecimal.valueOf(52)).divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
            case MONTHLY -> amount;
            case QUARTERLY -> amount.divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);
            case YEARLY -> amount.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        };
    }

    private SubscriptionDTO.Response toResponse(Subscription s) {
        long daysUntil = ChronoUnit.DAYS.between(LocalDate.now(), s.getNextRenewalDate());
        return SubscriptionDTO.Response.builder()
                .id(s.getId())
                .name(s.getName())
                .amount(s.getAmount())
                .currency(s.getCurrency())
                .billingCycle(s.getBillingCycle())
                .nextRenewalDate(s.getNextRenewalDate())
                .category(s.getCategory())
                .notes(s.getNotes())
                .logoUrl(s.getLogoUrl())
                .active(s.isActive())
                .daysUntilRenewal(daysUntil)
                .createdAt(s.getCreatedAt())
                .build();
    }
}
