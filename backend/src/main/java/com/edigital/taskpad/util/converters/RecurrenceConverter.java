package com.edigital.taskpad.util.converters;

import com.edigital.taskpad.model.Recurrence;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class RecurrenceConverter implements AttributeConverter<Recurrence, String> {
    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(Recurrence attribute) {
        try {
            return attribute == null ? null : mapper.writeValueAsString(attribute);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public Recurrence convertToEntityAttribute(String dbData) {
        try {
            return dbData == null || dbData.isEmpty() ? null : mapper.readValue(dbData, Recurrence.class);
        } catch (Exception e) {
            return null;
        }
    }
}
