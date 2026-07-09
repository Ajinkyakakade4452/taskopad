package com.edigital.taskpad.repository;

import com.edigital.taskpad.model.DiscussionMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiscussionRepository extends JpaRepository<DiscussionMessage, String> {
}
