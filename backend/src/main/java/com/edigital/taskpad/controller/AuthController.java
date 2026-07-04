package com.edigital.taskpad.controller;

import com.edigital.taskpad.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // In-memory user store (for simplicity; no DB table needed)
    private static final List<User> USERS = new ArrayList<>();

    static {
        // Admin user - full access to enterprise dashboard
        USERS.add(new User(
            "usr-admin-1",
            "Ajinkya Kakade",
            "admin@edigitalknowledge.com",
            "admin@123",
            "admin",
            "AK",
            "#0ea5e9"
        ));

        // User 1 - regular user, sees only their tasks
        USERS.add(new User(
            "usr-1",
            "Krishna Lokhande",
            "krishna@edigitalknowledge.com",
            "user@123",
            "user",
            "KL",
            "#8b5cf6"
        ));

        // User 2 - regular user, sees only their tasks
        USERS.add(new User(
            "usr-2",
            "Alister Manikam",
            "alister@edigitalknowledge.com",
            "user@123",
            "user",
            "AM",
            "#f59e0b"
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Email and password are required");
            return ResponseEntity.badRequest().body(error);
        }

        User matchedUser = USERS.stream()
            .filter(u -> u.getEmail().equalsIgnoreCase(email) && u.getPassword().equals(password))
            .findFirst()
            .orElse(null);

        if (matchedUser == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid email or password");
            return ResponseEntity.status(401).body(error);
        }

        // Return user info (excluding password)
        Map<String, Object> response = new HashMap<>();
        response.put("id", matchedUser.getId());
        response.put("name", matchedUser.getName());
        response.put("email", matchedUser.getEmail());
        response.put("role", matchedUser.getRole());
        response.put("initials", matchedUser.getInitials());
        response.put("avatarColor", matchedUser.getAvatarColor());
        response.put("token", "tk-" + System.currentTimeMillis() + "-" + matchedUser.getId());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (User u : USERS) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", u.getId());
            userMap.put("name", u.getName());
            userMap.put("email", u.getEmail());
            userMap.put("role", u.getRole());
            userMap.put("initials", u.getInitials());
            userMap.put("avatarColor", u.getAvatarColor());
            result.add(userMap);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/users")
    public ResponseEntity<?> addUser(@RequestBody Map<String, String> userData) {
        String name = userData.get("name");
        String email = userData.get("email");
        String password = userData.get("password");
        String role = userData.get("role");
        String avatarColor = userData.get("avatarColor");

        if (name == null || email == null || password == null || role == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Name, email, password, and role are required");
            return ResponseEntity.badRequest().body(error);
        }

        // Check if email already exists
        boolean emailExists = USERS.stream().anyMatch(u -> u.getEmail().equalsIgnoreCase(email));
        if (emailExists) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "User with this email already exists");
            return ResponseEntity.badRequest().body(error);
        }

        // Generate initials from name
        String[] nameParts = name.split(" ");
        String initials = "";
        if (nameParts.length >= 1) {
            initials += nameParts[0].charAt(0);
        }
        if (nameParts.length >= 2) {
            initials += nameParts[1].charAt(0);
        }
        initials = initials.toUpperCase();

        // Generate random avatar color if not provided
        if (avatarColor == null || avatarColor.isEmpty()) {
            String[] colors = {"#0ea5e9", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#ec4899", "#14b8a6"};
            avatarColor = colors[(int) (Math.random() * colors.length)];
        }

        User newUser = new User(
            "usr-" + UUID.randomUUID().toString(),
            name,
            email,
            password,
            role,
            initials,
            avatarColor
        );

        USERS.add(newUser);

        Map<String, Object> response = new HashMap<>();
        response.put("id", newUser.getId());
        response.put("name", newUser.getName());
        response.put("email", newUser.getEmail());
        response.put("role", newUser.getRole());
        response.put("initials", newUser.getInitials());
        response.put("avatarColor", newUser.getAvatarColor());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody Map<String, String> userData) {
        User user = USERS.stream().filter(u -> u.getId().equals(id)).findFirst().orElse(null);
        if (user == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "User not found");
            return ResponseEntity.status(404).body(error);
        }

        if (userData.containsKey("name")) {
            user.setName(userData.get("name"));
            // Update initials
            String[] nameParts = userData.get("name").split(" ");
            String initials = "";
            if (nameParts.length >= 1) {
                initials += nameParts[0].charAt(0);
            }
            if (nameParts.length >= 2) {
                initials += nameParts[1].charAt(0);
            }
            user.setInitials(initials.toUpperCase());
        }

        if (userData.containsKey("email")) {
            // Check if email is already taken by another user
            String newEmail = userData.get("email");
            boolean emailExists = USERS.stream().anyMatch(u -> !u.getId().equals(id) && u.getEmail().equalsIgnoreCase(newEmail));
            if (emailExists) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Email already in use by another user");
                return ResponseEntity.badRequest().body(error);
            }
            user.setEmail(newEmail);
        }

        if (userData.containsKey("password")) {
            user.setPassword(userData.get("password"));
        }

        if (userData.containsKey("role")) {
            user.setRole(userData.get("role"));
        }

        if (userData.containsKey("avatarColor")) {
            user.setAvatarColor(userData.get("avatarColor"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("initials", user.getInitials());
        response.put("avatarColor", user.getAvatarColor());

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        User user = USERS.stream().filter(u -> u.getId().equals(id)).findFirst().orElse(null);
        if (user == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "User not found");
            return ResponseEntity.status(404).body(error);
        }

        // Don't allow deleting the only admin
        long adminCount = USERS.stream().filter(u -> u.getRole().equals("admin")).count();
        if (user.getRole().equals("admin") && adminCount <= 1) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Cannot delete the only admin user");
            return ResponseEntity.badRequest().body(error);
        }

        USERS.remove(user);
        return ResponseEntity.ok().build();
    }
}
