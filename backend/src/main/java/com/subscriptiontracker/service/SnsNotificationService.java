package com.subscriptiontracker.service;

import com.subscriptiontracker.model.Subscription;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sns.model.PublishResponse;

@Service
@RequiredArgsConstructor
@Slf4j
public class SnsNotificationService {

    private final SnsClient snsClient;

    @Value("${aws.sns.topic.arn}")
    private String topicArn;

    public void publishRenewalAlert(Subscription subscription, long daysUntil) {
        String message = buildAlertMessage(subscription, daysUntil);
        String subject = String.format("Renewal Alert: %s renews in %d day(s)",
                subscription.getName(), daysUntil);

        try {
            PublishRequest request = PublishRequest.builder()
                    .topicArn(topicArn)
                    .message(message)
                    .subject(subject)
                    .messageAttribute("userEmail",
                        software.amazon.awssdk.services.sns.model.MessageAttributeValue.builder()
                            .dataType("String")
                            .stringValue(subscription.getUser().getEmail())
                            .build())
                    .build();

            PublishResponse response = snsClient.publish(request);
            log.info("SNS alert published for subscription {} — messageId: {}",
                    subscription.getName(), response.messageId());

        } catch (Exception e) {
            log.error("Failed to publish SNS alert for subscription {}: {}",
                    subscription.getName(), e.getMessage());
        }
    }

    private String buildAlertMessage(Subscription subscription, long daysUntil) {
        return String.format("""
                {
                  "subscriptionName": "%s",
                  "amount": %.2f,
                  "currency": "%s",
                  "renewalDate": "%s",
                  "daysUntilRenewal": %d,
                  "userEmail": "%s",
                  "userName": "%s"
                }
                """,
                subscription.getName(),
                subscription.getAmount(),
                subscription.getCurrency(),
                subscription.getNextRenewalDate(),
                daysUntil,
                subscription.getUser().getEmail(),
                subscription.getUser().getName()
        );
    }
}
