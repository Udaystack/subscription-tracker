package com.subscriptiontracker.repository;

import com.subscriptiontracker.model.Subscription;
import com.subscriptiontracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findByUserAndActiveTrue(User user);

    List<Subscription> findByUser(User user);

    @Query("SELECT s FROM Subscription s WHERE s.active = true AND s.nextRenewalDate BETWEEN :start AND :end")
    List<Subscription> findRenewingBetween(
        @Param("start") LocalDate start,
        @Param("end") LocalDate end
    );

    @Query("SELECT s FROM Subscription s WHERE s.user = :user AND s.active = true AND s.nextRenewalDate BETWEEN :start AND :end")
    List<Subscription> findByUserAndRenewalBetween(
        @Param("user") User user,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end
    );

    long countByUserAndActiveTrue(User user);
}
