package com.apex.telemetry.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Violation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String parameterType;
    private String description;
    private String severity;
    private LocalDateTime timestamp = LocalDateTime.now();

    public Violation(String parameterType, String description, String severity) {
        this.parameterType = parameterType;
        this.description = description;
        this.severity = severity;
    }

    public Violation() {}
}