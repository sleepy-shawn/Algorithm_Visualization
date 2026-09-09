package com.algorithmviz.controller;

import com.algorithmviz.dto.AlgorithmComparisonRequest;
import com.algorithmviz.dto.AlgorithmTraceRequest;
import com.algorithmviz.model.AlgorithmComparisonResponse;
import com.algorithmviz.model.AlgorithmTraceResponse;
import com.algorithmviz.service.AlgorithmTraceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/algorithms")
public class AlgorithmTraceController {

    private final AlgorithmTraceService traceService;

    public AlgorithmTraceController(AlgorithmTraceService traceService) {
        this.traceService = traceService;
    }

    @PostMapping("/trace")
    public ResponseEntity<AlgorithmTraceResponse> trace(
            @Valid @RequestBody AlgorithmTraceRequest request) {
        return ResponseEntity.ok(traceService.trace(request));
    }

    @PostMapping("/compare")
    public ResponseEntity<AlgorithmComparisonResponse> compare(
            @Valid @RequestBody AlgorithmComparisonRequest request) {
        return ResponseEntity.ok(traceService.compare(request));
    }

    @GetMapping("/trace/supported")
    public ResponseEntity<Map<String, List<String>>> supportedAlgorithms() {
        return ResponseEntity.ok(Map.of("algorithms", traceService.supportedAlgorithms()));
    }
}
