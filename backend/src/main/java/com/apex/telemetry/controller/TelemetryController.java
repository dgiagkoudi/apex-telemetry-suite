package com.apex.telemetry.controller;

import com.apex.telemetry.model.TelemetryData;
import com.apex.telemetry.model.Violation;
import com.apex.telemetry.service.TelemetryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/telemetry")
@CrossOrigin(originPatterns = "*", allowedHeaders = "*", allowCredentials = "false")
public class TelemetryController {

    @Autowired
    private TelemetryService telemetryService;

    @PostMapping
    public ResponseEntity<TelemetryData> receiveTelemetry(@Valid @RequestBody TelemetryData telemetryData) {
        TelemetryData saved = telemetryService.saveTelemetryDirectly(telemetryData);
        telemetryService.processTelemetryAsync(saved);

        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<TelemetryData>> getAllTelemetry(
            @PageableDefault(size = 50, sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(telemetryService.getAllTelemetryData(pageable));
    }

    @GetMapping("/violations")
    public ResponseEntity<List<Violation>> getAllViolations() {
        return ResponseEntity.ok(telemetryService.getAllViolations());
    }
}