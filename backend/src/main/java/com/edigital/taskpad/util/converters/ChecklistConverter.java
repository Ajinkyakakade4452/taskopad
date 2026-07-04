package com.edigital.taskpad.util.converters;

import com.edigital.taskpad.model.ChecklistItem;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.List;

@Converter
public class ChecklistConverter implements AttributeConverter<List<ChecklistItem>, String> {
    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<ChecklistItem> attribute) {
        try {
            return attribute == null ? null : mapper.writeValueAsString(attribute);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public List<ChecklistItem> convertToEntityAttribute(String dbData) {
        try {
            return dbData == null || dbData.isEmpty() ? null : mapper.readValue(dbData, new TypeReference<List<ChecklistItem>>() {});
        } catch (Exception e) {
            return null;
        }
    }
}
