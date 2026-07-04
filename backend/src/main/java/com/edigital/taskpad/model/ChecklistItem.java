package com.edigital.taskpad.model;

public class ChecklistItem {
    private String id;
    private String name;
    private boolean checked;

    // Constructors
    public ChecklistItem() {}

    public ChecklistItem(String id, String name, boolean checked) {
        this.id = id;
        this.name = name;
        this.checked = checked;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public boolean isChecked() { return checked; }
    public void setChecked(boolean checked) { this.checked = checked; }
}
