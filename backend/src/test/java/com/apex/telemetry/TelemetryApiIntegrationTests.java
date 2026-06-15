package com.apex.telemetry;

import com.apex.telemetry.model.TelemetryData;
import com.apex.telemetry.model.Violation;
import com.apex.telemetry.repository.TelemetryDataRepository;
import com.apex.telemetry.repository.ViolationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class TelemetryApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TelemetryDataRepository telemetryRepository;

    @Autowired
    private ViolationRepository violationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        telemetryRepository.deleteAll();
        violationRepository.deleteAll();
    }

    @Test
    @DisplayName("Successfully save valid telemetry data and return 201 Created")
    void testReceiveValidTelemetry() throws Exception {
        TelemetryData data = new TelemetryData();
        data.setRpm(5000);
        data.setBatteryTemperature(45.0);
        data.setSpeed(60.5);

        mockMvc.perform(post("/api/telemetry")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(data)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rpm").value(5000))
                .andExpect(jsonPath("$.batteryTemperature").value(45.0));

        assertEquals(1, telemetryRepository.count());
        assertEquals(0, violationRepository.count());
    }

    @Test
    @DisplayName("Detect and record CRITICAL violation when battery temperature is too high")
    void testCriticalBatteryTemperatureViolation() throws Exception {
        TelemetryData dangerousData = new TelemetryData();
        dangerousData.setRpm(4000);
        dangerousData.setBatteryTemperature(80.0);
        dangerousData.setSpeed(90.0);

        mockMvc.perform(post("/api/telemetry")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dangerousData)))
                .andExpect(status().isCreated());

        List<Violation> violations = violationRepository.findAll();
        assertEquals(1, violations.size());
        assertEquals("CRITICAL", violations.get(0).getSeverity());
        assertEquals("BATTERY_TEMP", violations.get(0).getParameterType());
    }

    @Test
    @DisplayName("Return 400 Bad Request when validation rules fail (negative RPM)")
    void testInvalidTelemetryValidation() throws Exception {
        TelemetryData invalidData = new TelemetryData();
        invalidData.setRpm(-500);
        invalidData.setBatteryTemperature(35.0);
        invalidData.setSpeed(40.0);

        mockMvc.perform(post("/api/telemetry")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidData)))
                .andExpect(status().isBadRequest());
    }
}