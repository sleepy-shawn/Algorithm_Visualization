package com.algorithmviz.model;

import java.util.List;
import java.util.Map;

public record AlgorithmTraceResponse(
        String algorithm,
        String category,
        List<Integer> input,
        Object result,
        List<TraceStep> steps,
        Metrics metrics,
        ComplexityProfile complexity
) {
    public record TraceStep(
            int stepNumber,
            String eventType,
            Integer codeLine,
            Map<String, Object> stateSnapshot,
            String explanation,
            Metrics metrics
    ) {}

    public record Metrics(
            int stepCount,
            int comparisons,
            int swaps,
            int accesses,
            long executionTimeNanos
    ) {}

    public record ComplexityProfile(
            String best,
            String average,
            String worst,
            String space
    ) {}
}
