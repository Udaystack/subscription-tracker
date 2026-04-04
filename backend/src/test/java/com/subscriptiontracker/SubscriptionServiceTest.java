package com.subscriptiontracker;

import com.subscriptiontracker.dto.SubscriptionDTO;
import com.subscriptiontracker.model.Subscription;
import com.subscriptiontracker.model.User;
import com.subscriptiontracker.repository.SubscriptionRepository;
import com.subscriptiontracker.service.SnsNotificationService;
import com.subscriptiontracker.service.SubscriptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubscriptionServiceTest {

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private SnsNotificationService snsService;

    @InjectMocks
    private SubscriptionService subscriptionService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .name("Test User")
                .emailNotifications(true)
                .reminderDaysBefore(3)
                .build();
    }

    @Test
    void createSubscription_shouldSaveAndReturn() {
        SubscriptionDTO.Request request = SubscriptionDTO.Request.builder()
                .name("Netflix")
                .amount(new BigDecimal("15.99"))
                .currency("USD")
                .billingCycle(Subscription.BillingCycle.MONTHLY)
                .nextRenewalDate(LocalDate.now().plusDays(15))
                .category("Entertainment")
                .build();

        Subscription saved = Subscription.builder()
                .id(1L)
                .name("Netflix")
                .amount(new BigDecimal("15.99"))
                .currency("USD")
                .billingCycle(Subscription.BillingCycle.MONTHLY)
                .nextRenewalDate(LocalDate.now().plusDays(15))
                .category("Entertainment")
                .active(true)
                .user(testUser)
                .build();

        when(subscriptionRepository.save(any())).thenReturn(saved);

        SubscriptionDTO.Response response = subscriptionService.createSubscription(request, testUser);

        assertThat(response).isNotNull();
        assertThat(response.getName()).isEqualTo("Netflix");
        assertThat(response.getAmount()).isEqualByComparingTo("15.99");
        verify(subscriptionRepository, times(1)).save(any());
    }

    @Test
    void getSummary_shouldCalculateMonthlyTotal() {
        List<Subscription> subs = List.of(
                buildSub("Netflix", "15.99", Subscription.BillingCycle.MONTHLY, 20),
                buildSub("Spotify", "9.99", Subscription.BillingCycle.MONTHLY, 10),
                buildSub("AWS", "120.00", Subscription.BillingCycle.YEARLY, 30)
        );

        when(subscriptionRepository.findByUserAndActiveTrue(testUser)).thenReturn(subs);

        SubscriptionDTO.Summary summary = subscriptionService.getSummary(testUser);

        assertThat(summary.getActiveCount()).isEqualTo(3);
        assertThat(summary.getTotalMonthly()).isGreaterThan(BigDecimal.ZERO);
    }

    private Subscription buildSub(String name, String amount, Subscription.BillingCycle cycle, int daysUntil) {
        return Subscription.builder()
                .id(1L).name(name)
                .amount(new BigDecimal(amount))
                .currency("USD")
                .billingCycle(cycle)
                .nextRenewalDate(LocalDate.now().plusDays(daysUntil))
                .active(true).user(testUser).build();
    }
}
