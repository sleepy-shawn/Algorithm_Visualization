package com.algorithmviz.exception;

import java.util.Map;

public class AlgorithmTraceException extends RuntimeException {

    public enum ErrorType {
        INVALID_INPUT,
        BOUNDARY_CONDITION,
        PRECONDITION_NOT_MET,
        LOGIC_ERROR
    }

    private final ErrorType errorType;
    private final String code;
    private final String algorithm;
    private final Integer codeLine;
    private final Map<String, Object> details;

    public AlgorithmTraceException(ErrorType errorType, String code, String message,
                                   String algorithm, Integer codeLine,
                                   Map<String, Object> details) {
        super(message);
        this.errorType = errorType;
        this.code = code;
        this.algorithm = algorithm;
        this.codeLine = codeLine;
        this.details = details == null ? Map.of() : Map.copyOf(details);
    }

    public ErrorType getErrorType() { return errorType; }
    public String getCode() { return code; }
    public String getAlgorithm() { return algorithm; }
    public Integer getCodeLine() { return codeLine; }
    public Map<String, Object> getDetails() { return details; }
}
