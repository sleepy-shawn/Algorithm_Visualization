package com.algorithmviz.model;

import java.util.List;

public record AlgorithmComparisonResponse(
        List<Integer> input,
        boolean comparable,
        List<String> limitations,
        List<ComparisonResult> results
) {
    public record ComparisonResult(
            String algorithm,
            String category,
            Object result,
            AlgorithmTraceResponse.Metrics metrics,
            AlgorithmTraceResponse.ComplexityProfile complexity
    ) {}
}
