package com.edigital.taskpad.util.converters;

import com.edigital.taskpad.model.SubTask;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.List;

@Converter
public class SubTaskListConverter implements AttributeConverter<List<SubTask>, String> {
    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<SubTask> attribute) {
        try {
            return attribute == null ? null : mapper.writeValueAsString(attribute);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public List<SubTask> convertToEntityAttribute(String dbData) {
        try {
            return dbData == null || dbData.isEmpty() ? null : mapper.readValue(dbData, new TypeReference<List<SubTask>>() {});
        } catch (Exception e) {
            return null;
        }
    }
}
