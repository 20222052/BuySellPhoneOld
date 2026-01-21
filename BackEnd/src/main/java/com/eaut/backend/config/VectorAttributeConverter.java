//package com.eaut.backend.config;
//
//import jakarta.persistence.AttributeConverter;
//import jakarta.persistence.Converter;
//import org.postgresql.util.PGobject;
//
//import java.sql.SQLException;
//
///**
// * JPA AttributeConverter để chuyển đổi giữa String (Java) và vector
// * (PostgreSQL)
// * Sử dụng PGobject để wrap giá trị vector
// */
//@Converter
//public class VectorAttributeConverter implements AttributeConverter<String, PGobject> {
//
//    @Override
//    public PGobject convertToDatabaseColumn(String attribute) {
//        if (attribute == null) {
//            return null;
//        }
//
//        PGobject pgObject = new PGobject();
//        pgObject.setType("vector");
//        try {
//            pgObject.setValue(attribute);
//        } catch (SQLException e) {
//            throw new RuntimeException("Error converting String to PGobject vector", e);
//        }
//        return pgObject;
//    }
//
//    @Override
//    public String convertToEntityAttribute(PGobject dbData) {
//        if (dbData == null) {
//            return null;
//        }
//        return dbData.getValue();
//    }
//}
