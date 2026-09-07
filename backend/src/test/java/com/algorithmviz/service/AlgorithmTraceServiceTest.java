package com.algorithmviz.service;

import com.algorithmviz.dto.AlgorithmComparisonRequest;
import com.algorithmviz.dto.AlgorithmTraceRequest;
import com.algorithmviz.exception.AlgorithmTraceException;
import com.algorithmviz.model.AlgorithmComparisonResponse;
import com.algorithmviz.model.AlgorithmTraceResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AlgorithmTraceServiceTest {

    private AlgorithmTraceService service;

    @BeforeEach
    void setUp() {
        service = new AlgorithmTraceService(new SortingService(), new SearchService());
    }

    @Test
    void sortingAlgorithmsShareOneTraceProtocol() {
        for (String algorithm : List.of("quick-sort", "bubble-sort", "insertion-sort")) {
            AlgorithmTraceResponse response = service.trace(traceRequest(
                    algorithm, List.of(5, 1, 4, 2, 3), null));

            assertEquals("sorting", response.category());
            assertEquals(List.of(1, 2, 3, 4, 5), response.result());
            assertFalse(response.steps().isEmpty());
            assertEquals(1, response.steps().get(0).stepNumber());
            assertNotNull(response.steps().get(0).eventType());
            assertNotNull(response.steps().get(0).codeLine());
            assertTrue(response.steps().get(0).stateSnapshot().containsKey("array"));
            assertNotNull(response.steps().get(0).explanation());
        }
    }

    @Test
    void binarySearchRejectsUnsortedInputWithCodeLine() {
        AlgorithmTraceException error = assertThrows(
                AlgorithmTraceException.class,
                () -> service.trace(traceRequest(
                        "binary-search", List.of(3, 1, 2), 2)));

        assertEquals(AlgorithmTraceException.ErrorType.PRECONDITION_NOT_MET,
                error.getErrorType());
        assertEquals("ARRAY_NOT_SORTED", error.getCode());
        assertEquals(1, error.getCodeLine());
        assertTrue(error.getDetails().containsKey("leftIndex"));
    }

    @Test
    void comparesThreeSortingAlgorithmsOnTheSameInput() {
        AlgorithmComparisonRequest request = new AlgorithmComparisonRequest();
        request.setAlgorithms(List.of("quick-sort", "merge-sort", "heap-sort"));
        request.setArray(List.of(9, 2, 7, 1, 4));

        AlgorithmComparisonResponse response = service.compare(request);

        assertTrue(response.comparable());
        assertEquals(3, response.results().size());
        assertTrue(response.results().stream()
                .allMatch(result -> List.of(1, 2, 4, 7, 9).equals(result.result())));
        assertTrue(response.results().stream()
                .allMatch(result -> result.metrics().stepCount() > 0));
        assertFalse(response.limitations().isEmpty());
    }

    @Test
    void explainsWhyCrossCategoryComparisonIsNotFair() {
        AlgorithmComparisonRequest request = new AlgorithmComparisonRequest();
        request.setAlgorithms(List.of("quick-sort", "binary-search"));
        request.setArray(List.of(1, 2, 3, 4));
        request.setTarget(3);

        AlgorithmComparisonResponse response = service.compare(request);

        assertFalse(response.comparable());
        assertTrue(response.results().isEmpty());
        assertTrue(response.limitations().stream()
                .anyMatch(text -> text.contains("不能公平比较")));
    }

    @Test
    void reportsUnsupportedAlgorithmAsInvalidInput() {
        AlgorithmTraceException error = assertThrows(
                AlgorithmTraceException.class,
                () -> service.trace(traceRequest("bogus", List.of(1, 2), null)));

        assertEquals(AlgorithmTraceException.ErrorType.INVALID_INPUT, error.getErrorType());
        assertEquals("UNSUPPORTED_ALGORITHM", error.getCode());
    }

    private AlgorithmTraceRequest traceRequest(String algorithm, List<Integer> array, Integer target) {
        AlgorithmTraceRequest request = new AlgorithmTraceRequest();
        request.setAlgorithm(algorithm);
        request.setArray(array);
        request.setTarget(target);
        return request;
    }
}
