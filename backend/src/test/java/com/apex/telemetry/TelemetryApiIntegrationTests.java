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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
    @DisplayName("Successfully save expanded telemetry data")
    void testReceiveValidTelemetry() throws Exception {
        TelemetryData data = new TelemetryData();
        data.setRpm(6000);
        data.setBatteryTemperature(42.0);
        data.setSpeed(85.3);
        data.setStateOfCharge(88.5);
        data.setAccumulatorVoltage(350.0);
        data.setAccumulatorCurrent(100.0);
        data.setGForceX(1.2);
        data.setSteeringAngle(5.0);
        data.setThrottlePosition(90.0);
        data.setBrakePosition(0.0);

        mockMvc.perform(post("/api/telemetry")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(data)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rpm").value(6000))
                .andExpect(jsonPath("$.stateOfCharge").value(88.5));

        assertEquals(1, telemetryRepository.count());
    }

    @Test
    @DisplayName("Verify pagination on GET /api/telemetry")
    void testGetTelemetryWithPagination() throws Exception {
        TelemetryData data = new TelemetryData();
        data.setRpm(4000);
        data.setSpeed(50.0);
        data.setBatteryTemperature(35.0);
        telemetryRepository.save(data);

        mockMvc.perform(get("/api/telemetry?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].rpm").value(4000))
                .andExpect(jsonPath("$.totalElements").value(1));
    }
}