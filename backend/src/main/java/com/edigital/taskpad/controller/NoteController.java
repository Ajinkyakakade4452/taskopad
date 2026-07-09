package com.edigital.taskpad.controller;

import com.edigital.taskpad.model.Note;
import com.edigital.taskpad.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private NoteRepository noteRepository;

    @GetMapping
    public ResponseEntity<List<Note>> getAllNotes() {
        return ResponseEntity.ok(noteRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Note> createNote(@RequestBody Note note) {
        if (note.getId() == null || note.getId().isEmpty()) {
            note.setId("note-" + System.currentTimeMillis());
        }
        Note saved = noteRepository.save(note);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable String id, @RequestBody Note noteDetails) {
        return noteRepository.findById(id).map(note -> {
            note.setTitle(noteDetails.getTitle());
            note.setContent(noteDetails.getContent());
            note.setDate(noteDetails.getDate());
            note.setStarred(noteDetails.isStarred());
            note.setColor(noteDetails.getColor());
            return ResponseEntity.ok(noteRepository.save(note));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable String id) {
        if (noteRepository.existsById(id)) {
            noteRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
