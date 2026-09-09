package com.algorithmviz.controller;

import com.algorithmviz.exception.AlgorithmTraceException;
import com.algorithmviz.model.AlgorithmApiError;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice(assignableTypes = AlgorithmTraceController.class)
public class AlgorithmTraceExceptionHandler {

    @ExceptionHandler(AlgorithmTraceException.class)
    public ResponseEntity<AlgorithmApiError> handleTraceException(AlgorithmTraceException error) {
        HttpStatus status = error.getErrorType() == AlgorithmTraceException.ErrorType.LOGIC_ERROR
                ? HttpStatus.INTERNAL_SERVER_ERROR
                : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(new AlgorithmApiError(
                error.getErrorType().name(),
                error.getCode(),
                error.getMessage(),
                error.getAlgorithm(),
                error.getCodeLine(),
                error.getDetails(),
                Instant.now()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<AlgorithmApiError> handleValidation(MethodArgumentNotValidException error) {
        FieldError fieldError = error.getBindingResult().getFieldErrors().stream()
                .findFirst().orElse(null);
        Map<String, Object> details = new LinkedHashMap<>();
        if (fieldError != null) {
            details.put("field", fieldError.getField());
        }
        String message = fieldError == null ? "请求参数验证失败" : fieldError.getDefaultMessage();
        return ResponseEntity.badRequest().body(new AlgorithmApiError(
                AlgorithmTraceException.ErrorType.INVALID_INPUT.name(),
                "VALIDATION_ERROR",
                message,
                null,
                null,
                details,
                Instant.now()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<AlgorithmApiError> handleMalformedJson(HttpMessageNotReadableException error) {
        return ResponseEntity.badRequest().body(new AlgorithmApiError(
                AlgorithmTraceException.ErrorType.INVALID_INPUT.name(),
                "MALFORMED_JSON",
                "请求体不是有效的 JSON",
                null,
                null,
                Map.of(),
                Instant.now()));
    }
}
