package com.edigital.taskpad.model;

import java.util.List;

public class Recurrence {
    private String repeatType;
    private int repeatEvery;
    private List<String> weekdays;
    private String repeatOn;
    private String customRule;
    private String endOption;
    private String endDate;
    private Integer occurrences;

    // Constructors
    public Recurrence() {}

    public Recurrence(String repeatType, int repeatEvery, List<String> weekdays, String repeatOn, 
                      String customRule, String endOption, String endDate, Integer occurrences) {
        this.repeatType = repeatType;
        this.repeatEvery = repeatEvery;
        this.weekdays = weekdays;
        this.repeatOn = repeatOn;
        this.customRule = customRule;
        this.endOption = endOption;
        this.endDate = endDate;
        this.occurrences = occurrences;
    }

    // Getters and Setters
    public String getRepeatType() { return repeatType; }
    public void setRepeatType(String repeatType) { this.repeatType = repeatType; }

    public int getRepeatEvery() { return repeatEvery; }
    public void setRepeatEvery(int repeatEvery) { this.repeatEvery = repeatEvery; }

    public List<String> getWeekdays() { return weekdays; }
    public void setWeekdays(List<String> weekdays) { this.weekdays = weekdays; }

    public String getRepeatOn() { return repeatOn; }
    public void setRepeatOn(String repeatOn) { this.repeatOn = repeatOn; }

    public String getCustomRule() { return customRule; }
    public void setCustomRule(String customRule) { this.customRule = customRule; }

    public String getEndOption() { return endOption; }
    public void setEndOption(String endOption) { this.endOption = endOption; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public Integer getOccurrences() { return occurrences; }
    public void setOccurrences(Integer occurrences) { this.occurrences = occurrences; }
}
