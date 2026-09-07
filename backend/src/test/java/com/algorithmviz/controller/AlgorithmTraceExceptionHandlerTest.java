package com.algorithmviz.controller;

import com.algorithmviz.exception.AlgorithmTraceException;
import com.algorithmviz.model.AlgorithmApiError;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class AlgorithmTraceExceptionHandlerTest {

    private final AlgorithmTraceExceptionHandler handler = new AlgorithmTraceExceptionHandler();

    @Test
    void errorResponseIncludesTypeReasonAndCodeLine() {
        AlgorithmTraceException exception = new AlgorithmTraceException(
                AlgorithmTraceException.ErrorType.PRECONDITION_NOT_MET,
                "ARRAY_NOT_SORTED",
                "二分查找要求输入数组按升序排列",
                "binary-search",
                1,
                Map.of("leftIndex", 0, "rightIndex", 1));

        ResponseEntity<AlgorithmApiError> response = handler.handleTraceException(exception);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("PRECONDITION_NOT_MET", response.getBody().errorType());
        assertEquals("ARRAY_NOT_SORTED", response.getBody().code());
        assertEquals(1, response.getBody().codeLine());
    }
}
