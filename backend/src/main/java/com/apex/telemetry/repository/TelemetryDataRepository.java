package com.apex.telemetry.repository;

import com.apex.telemetry.model.TelemetryData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TelemetryDataRepository extends JpaRepository<TelemetryData, Long> {

}