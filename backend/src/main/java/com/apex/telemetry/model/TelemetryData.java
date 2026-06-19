package com.apex.telemetry.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
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

    @Min(value = 0) @Max(value = 100)
    private Double stateOfCharge;

    private Double accumulatorVoltage;
    private Double accumulatorCurrent;

    private Double gForceX;
    private Double gForceY;
    private Double gForceZ;

    private Double steeringAngle;

    @Min(0) @Max(100)
    private Double throttlePosition;

    @Min(0) @Max(100)
    private Double brakePosition;

    private LocalDateTime timestamp = LocalDateTime.now();
}