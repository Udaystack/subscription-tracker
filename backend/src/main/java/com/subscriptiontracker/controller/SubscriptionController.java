package com.subscriptiontracker.controller;

import com.subscriptiontracker.dto.SubscriptionDTO;
import com.subscriptiontracker.model.User;
import com.subscriptiontracker.repository.UserRepository;
import com.subscriptiontracker.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<SubscriptionDTO.Response> create(
            @Valid @RequestBody SubscriptionDTO.Request request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(subscriptionService.createSubscription(request, user));
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionDTO.Response>> getAll(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(subscriptionService.getSubscriptions(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionDTO.Response> getOne(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(subscriptionService.getSubscription(id, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionDTO.Response> update(
            @PathVariable Long id,
            @Valid @RequestBody SubscriptionDTO.Request request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(subscriptionService.updateSubscription(id, request, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        subscriptionService.deleteSubscription(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<SubscriptionDTO.Summary> getSummary(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(subscriptionService.getSummary(user));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
