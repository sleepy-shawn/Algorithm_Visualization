package com.algorithmviz.model;

import java.time.Instant;
import java.util.Map;

public record AlgorithmApiError(
        String errorType,
        String code,
        String message,
        String algorithm,
        Integer codeLine,
        Map<String, Object> details,
        Instant timestamp
) {}
