package com.subscriptiontracker.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RenewalSchedulerService {

    private final SubscriptionService subscriptionService;

    // Runs every day at 8:00 AM
    @Scheduled(cron = "0 0 8 * * *")
    public void checkDailyRenewals() {
        log.info("Running daily renewal check...");
        subscriptionService.checkAndNotifyRenewals();
        log.info("Daily renewal check complete.");
    }
}
