package com.apex.telemetry.controller;

import com.apex.telemetry.model.TelemetryData;
import com.apex.telemetry.model.Violation;
import com.apex.telemetry.service.TelemetryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/telemetry")
@CrossOrigin(origins = "*")
public class TelemetryController {

    @Autowired
    private TelemetryService telemetryService;

    @PostMapping
    public ResponseEntity<TelemetryData> receiveTelemetry(@Valid @RequestBody TelemetryData telemetryData) {
        TelemetryData processed = telemetryService.processAndSaveTelemetry(telemetryData);
        return new ResponseEntity<>(processed, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TelemetryData>> getAllTelemetry() {
        return ResponseEntity.ok(telemetryService.getAllTelemetryData());
    }

    @GetMapping("/violations")
    public ResponseEntity<List<Violation>> getAllViolations() {
        return ResponseEntity.ok(telemetryService.getAllViolations());
    }
}