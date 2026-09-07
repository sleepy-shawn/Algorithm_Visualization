package com.algorithmviz.controller;

import com.algorithmviz.service.AlgorithmTraceService;
import com.algorithmviz.service.SearchService;
import com.algorithmviz.service.SortingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AlgorithmTraceControllerTest {

    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        AlgorithmTraceService service = new AlgorithmTraceService(
                new SortingService(), new SearchService());
        mvc = MockMvcBuilders.standaloneSetup(new AlgorithmTraceController(service))
                .setControllerAdvice(new AlgorithmTraceExceptionHandler())
                .build();
    }

    @Test
    void traceSerializesTheSharedStepProtocol() throws Exception {
        mvc.perform(post("/api/algorithms/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"algorithm\":\"bubble-sort\",\"array\":[3,1,2]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result[0]").value(1))
                .andExpect(jsonPath("$.result[2]").value(3))
                .andExpect(jsonPath("$.steps[0].stepNumber").value(1))
                .andExpect(jsonPath("$.steps[0].eventType").isString())
                .andExpect(jsonPath("$.steps[0].codeLine").isNumber())
                .andExpect(jsonPath("$.steps[0].stateSnapshot.array").isArray())
                .andExpect(jsonPath("$.steps[0].explanation").isString());
    }

    @Test
    void comparisonSerializesResultsAndLimitations() throws Exception {
        mvc.perform(post("/api/algorithms/compare")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"algorithms\":[\"quick-sort\",\"merge-sort\",\"heap-sort\"],\"array\":[3,1,2]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.comparable").value(true))
                .andExpect(jsonPath("$.results", hasSize(3)))
                .andExpect(jsonPath("$.results[0].result[0]").value(1))
                .andExpect(jsonPath("$.limitations").isNotEmpty());
    }

    @Test
    void supportedEndpointListsSixAlgorithms() throws Exception {
        mvc.perform(get("/api/algorithms/trace/supported"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.algorithms", hasSize(6)));
    }

    @ParameterizedTest
    @ValueSource(strings = {"trace", "compare"})
    void emptyArrayRemainsABoundaryErrorThroughHttpValidation(String endpoint) throws Exception {
        mvc.perform(post("/api/algorithms/" + endpoint)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody("[]")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorType").value("BOUNDARY_CONDITION"))
                .andExpect(jsonPath("$.code").value("EMPTY_ARRAY"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"trace", "compare"})
    void oversizedArrayRemainsABoundaryErrorThroughHttpValidation(String endpoint) throws Exception {
        String array = "[" + String.join(",", Collections.nCopies(201, "1")) + "]";
        mvc.perform(post("/api/algorithms/" + endpoint)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody(array)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorType").value("BOUNDARY_CONDITION"))
                .andExpect(jsonPath("$.code").value("INPUT_TOO_LARGE"))
                .andExpect(jsonPath("$.details.maximumSize").value(200));
    }

    @Test
    void unsortedSearchInputLocatesThePreconditionFailure() throws Exception {
        mvc.perform(post("/api/algorithms/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"algorithm\":\"binary-search\",\"array\":[3,1,2],\"target\":2}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorType").value("PRECONDITION_NOT_MET"))
                .andExpect(jsonPath("$.codeLine").value(1))
                .andExpect(jsonPath("$.details.leftIndex").value(0));
    }

    @Test
    void malformedJsonReturnsTheCommonErrorFormat() throws Exception {
        mvc.perform(post("/api/algorithms/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{invalid-json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorType").value("INVALID_INPUT"))
                .andExpect(jsonPath("$.code").value("MALFORMED_JSON"));
    }

    @Test
    void nullArrayElementIsRejectedBeforeExecution() throws Exception {
        mvc.perform(post("/api/algorithms/trace")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody("[1,null,2]")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorType").value("INVALID_INPUT"));
    }

    private String requestBody(String array) {
        return "{\"algorithm\":\"quick-sort\","
                + "\"algorithms\":[\"quick-sort\",\"merge-sort\"],\"array\":" + array + "}";
    }
}
