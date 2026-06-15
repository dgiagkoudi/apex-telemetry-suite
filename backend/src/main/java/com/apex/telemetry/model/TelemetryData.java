package com.apex.telemetry.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class TelemetryData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "RPM cannot be null")
    @Min(value = 0, message = "RPM must be positive")
    private Integer rpm;

    @NotNull(message = "Battery temperature cannot be null")
    private Double batteryTemperature;

    @NotNull(message = "Speed cannot be null")
    @Min(value = 0, message = "Speed must be positive")
    private Double speed;

    private LocalDateTime timestamp = LocalDateTime.now();
}