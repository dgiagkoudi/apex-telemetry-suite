package com.apex.telemetry.service;

import com.apex.telemetry.model.TelemetryData;
import com.apex.telemetry.model.Violation;
import com.apex.telemetry.repository.TelemetryDataRepository;
import com.apex.telemetry.repository.ViolationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TelemetryService {

    @Autowired
    private TelemetryDataRepository telemetryRepository;

    @Autowired
    private ViolationRepository violationRepository;

    // Όρια ασφαλείας για το μονοθέσιο της Formula Student
    private static final double MAX_BATTERY_TEMP_WARNING = 60.0;
    private static final double MAX_BATTERY_TEMP_CRITICAL = 75.0;
    private static final int MAX_RPM = 10000;

    @Transactional
    public TelemetryData processAndSaveTelemetry(TelemetryData data) {
        TelemetryData savedData = telemetryRepository.save(data);

        checkThresholds(savedData);

        return savedData;
    }

    public List<TelemetryData> getAllTelemetryData() {
        return telemetryRepository.findAll();
    }

    public List<Violation> getAllViolations() {
        return violationRepository.findAll();
    }

    private void checkThresholds(TelemetryData data) {
        if (data.getBatteryTemperature() >= MAX_BATTERY_TEMP_CRITICAL) {
            Violation criticalViolation = new Violation(
                    "BATTERY_TEMP",
                    "CRITICAL: Battery temperature reached " + data.getBatteryTemperature() + "°C! Pull over immediately.",
                    "CRITICAL"
            );
            violationRepository.save(criticalViolation);
        } else if (data.getBatteryTemperature() >= MAX_BATTERY_TEMP_WARNING) {
            Violation warningViolation = new Violation(
                    "BATTERY_TEMP",
                    "WARNING: High battery temperature detected: " + data.getBatteryTemperature() + "°C.",
                    "WARNING"
            );
            violationRepository.save(warningViolation);
        }

        if (data.getRpm() > MAX_RPM) {
            Violation rpmViolation = new Violation(
                    "RPM",
                    "WARNING: Engine over-revving detected: " + data.getRpm() + " RPM (Max allowed: " + MAX_RPM + ").",
                    "WARNING"
            );
            violationRepository.save(rpmViolation);
        }
    }
}