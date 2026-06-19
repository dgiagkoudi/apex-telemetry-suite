package com.apex.telemetry.service;

import com.apex.telemetry.model.TelemetryData;
import com.apex.telemetry.model.Violation;
import com.apex.telemetry.repository.TelemetryDataRepository;
import com.apex.telemetry.repository.ViolationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TelemetryService {

    @Autowired
    private TelemetryDataRepository telemetryRepository;

    @Autowired
    private ViolationRepository violationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private static final String WS_LIVE_DATA_TOPIC = "/topic/live-data";
    private static final String WS_VIOLATIONS_TOPIC = "/topic/violations";

    private static final double MAX_BATTERY_TEMP_WARNING = 60.0;
    private static final double MAX_BATTERY_TEMP_CRITICAL = 75.0;
    private static final int MAX_RPM = 10000;
    private static final double MAX_POWER_KW = 80.0;

    private final ConcurrentHashMap<String, String> activeViolations = new ConcurrentHashMap<>();

    @Transactional
    public TelemetryData saveTelemetryDirectly(TelemetryData data) {
        return telemetryRepository.save(data);
    }

    @Async
    @Transactional
    public void processTelemetryAsync(TelemetryData data) {
        messagingTemplate.convertAndSend(WS_LIVE_DATA_TOPIC, data);

        checkThresholds(data);
    }

    public Page<TelemetryData> getAllTelemetryData(Pageable pageable) {
        return telemetryRepository.findAll(pageable);
    }

    public List<Violation> getAllViolations() {
        return violationRepository.findAll();
    }

    private void checkThresholds(TelemetryData data) {
        String batKey = "BATTERY_TEMP";
        if (data.getBatteryTemperature() >= MAX_BATTERY_TEMP_CRITICAL) {
            triggerViolation(batKey, "CRITICAL",
                    "CRITICAL: Battery reached " + data.getBatteryTemperature() + "°C!"
            );
        } else if (data.getBatteryTemperature() >= MAX_BATTERY_TEMP_WARNING) {
            triggerViolation(batKey, "WARNING",
                    "WARNING: High battery temperature: " + data.getBatteryTemperature() + "°C."
            );
        } else {
            clearViolation(batKey);
        }

        String rpmKey = "RPM";
        if (data.getRpm() > MAX_RPM) {
            triggerViolation(rpmKey, "WARNING",
                    "WARNING: Engine over-revving: " + data.getRpm() + " RPM."
            );
        } else {
            clearViolation(rpmKey);
        }

        if (data.getAccumulatorVoltage() != null && data.getAccumulatorCurrent() != null) {
            double powerKw = (data.getAccumulatorVoltage() * data.getAccumulatorCurrent()) / 1000.0;
            String powerKey = "POWER_LIMIT";
            if (powerKw > MAX_POWER_KW) {
                triggerViolation(powerKey, "CRITICAL",
                        "RULE VIOLATION: Power exceeded 80kW! Current: " + powerKw + " kW."
                );
            } else {
                clearViolation(powerKey);
            }
        }
    }

    private void triggerViolation(String key, String severity, String description) {
        if (!severity.equals(activeViolations.get(key))) {
            activeViolations.put(key, severity);

            Violation violation = new Violation(key, description, severity);
            violationRepository.save(violation);

            messagingTemplate.convertAndSend(WS_VIOLATIONS_TOPIC, violation);
        }
    }

    private void clearViolation(String key) {
        if (activeViolations.containsKey(key)) {
            activeViolations.remove(key);
            Violation clearNotice = new Violation(key, "INFO: Status returned to normal.", "CLEARED");
            messagingTemplate.convertAndSend(WS_VIOLATIONS_TOPIC, clearNotice);
        }
    }
}