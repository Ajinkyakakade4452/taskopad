package com.edigital.taskpad.controller;

import com.edigital.taskpad.model.TimeEntry;
import com.edigital.taskpad.repository.TimeEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timesheet")
public class TimeEntryController {

    @Autowired
    private TimeEntryRepository timeEntryRepository;

    @GetMapping
    public ResponseEntity<List<TimeEntry>> getAllTimeEntries() {
        return ResponseEntity.ok(timeEntryRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<TimeEntry> createTimeEntry(@RequestBody TimeEntry entry) {
        if (entry.getId() == null || entry.getId().isEmpty()) {
            entry.setId("te-" + System.currentTimeMillis());
        }
        TimeEntry saved = timeEntryRepository.save(entry);
        return ResponseEntity.ok(saved);
    }
}
