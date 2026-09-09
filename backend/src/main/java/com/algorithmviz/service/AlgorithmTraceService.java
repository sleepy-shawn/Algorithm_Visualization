package com.algorithmviz.service;

import com.algorithmviz.dto.AlgorithmComparisonRequest;
import com.algorithmviz.dto.AlgorithmTraceRequest;
import com.algorithmviz.exception.AlgorithmTraceException;
import com.algorithmviz.model.AlgorithmComparisonResponse;
import com.algorithmviz.model.AlgorithmTraceResponse;
import com.algorithmviz.model.SearchStep;
import com.algorithmviz.model.SortStep;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import static com.algorithmviz.exception.AlgorithmTraceException.ErrorType.BOUNDARY_CONDITION;
import static com.algorithmviz.exception.AlgorithmTraceException.ErrorType.INVALID_INPUT;
import static com.algorithmviz.exception.AlgorithmTraceException.ErrorType.LOGIC_ERROR;
import static com.algorithmviz.exception.AlgorithmTraceException.ErrorType.PRECONDITION_NOT_MET;

@Service
public class AlgorithmTraceService {

    private static final Set<String> SORT_ALGORITHMS = Set.of(
            "quick-sort", "merge-sort", "bubble-sort", "heap-sort", "insertion-sort");
    private static final Set<String> SEARCH_ALGORITHMS = Set.of("binary-search");
    private static final int MAX_INPUT_SIZE = 200;

    private final SortingService sortingService;
    private final SearchService searchService;

    public AlgorithmTraceService(SortingService sortingService, SearchService searchService) {
        this.sortingService = sortingService;
        this.searchService = searchService;
    }

    public AlgorithmTraceResponse trace(AlgorithmTraceRequest request) {
        String algorithm = validateRequest(request);
        try {
            if (SORT_ALGORITHMS.contains(algorithm)) {
                return traceSort(algorithm, request.getArray());
            }
            if (SEARCH_ALGORITHMS.contains(algorithm)) {
                return traceBinarySearch(algorithm, request.getArray(), request.getTarget());
            }
            throw error(INVALID_INPUT, "UNSUPPORTED_ALGORITHM",
                    "不支持的算法：" + algorithm, algorithm, null,
                    Map.of("supportedAlgorithms", supportedAlgorithms()));
        } catch (AlgorithmTraceException e) {
            throw e;
        } catch (RuntimeException e) {
            throw error(LOGIC_ERROR, "ALGORITHM_EXECUTION_FAILED",
                    "算法执行失败：" + e.getMessage(), algorithm, null, Map.of());
        }
    }

    public AlgorithmComparisonResponse compare(AlgorithmComparisonRequest request) {
        validateArray(request == null ? null : request.getArray(), null);
        if (request.getAlgorithms() == null || request.getAlgorithms().size() < 2) {
            throw error(INVALID_INPUT, "TOO_FEW_ALGORITHMS",
                    "至少需要两个算法才能进行对比", null, null, Map.of());
        }

        List<String> algorithms = request.getAlgorithms().stream()
                .map(this::normalizeAlgorithm)
                .toList();
        if (algorithms.stream().anyMatch(String::isBlank)) {
            throw error(INVALID_INPUT, "ALGORITHM_REQUIRED",
                    "算法名称不能为空", null, null, Map.of());
        }
        if (new LinkedHashSet<>(algorithms).size() != algorithms.size()) {
            throw error(INVALID_INPUT, "DUPLICATE_ALGORITHMS",
                    "对比列表中不能包含重复算法", null, null, Map.of());
        }
        List<String> unsupported = algorithms.stream()
                .filter(name -> !isSupported(name))
                .toList();
        if (!unsupported.isEmpty()) {
            throw error(INVALID_INPUT, "UNSUPPORTED_ALGORITHM",
                    "对比列表包含不支持的算法", null, null,
                    Map.of("unsupportedAlgorithms", unsupported,
                            "supportedAlgorithms", supportedAlgorithms()));
        }

        Set<String> categories = algorithms.stream()
                .map(this::categoryOf)
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
        if (categories.size() > 1) {
            return new AlgorithmComparisonResponse(
                    List.copyOf(request.getArray()),
                    false,
                    List.of(
                            "排序与查找算法的任务目标不同，步骤数和操作计数不能公平比较。",
                            "请只选择同一类别的算法。"),
                    List.of());
        }
        if (!categories.contains("sorting")) {
            return new AlgorithmComparisonResponse(
                    List.copyOf(request.getArray()),
                    false,
                    List.of("当前只有一种可用的查找算法，无法形成公平的同类对比。"),
                    List.of());
        }

        List<AlgorithmComparisonResponse.ComparisonResult> results = new ArrayList<>();
        List<Integer> expectedResult = null;
        for (String algorithm : algorithms) {
            AlgorithmTraceRequest traceRequest = new AlgorithmTraceRequest();
            traceRequest.setAlgorithm(algorithm);
            traceRequest.setArray(request.getArray());
            AlgorithmTraceResponse trace = trace(traceRequest);
            @SuppressWarnings("unchecked")
            List<Integer> actualResult = (List<Integer>) trace.result();
            if (expectedResult == null) {
                expectedResult = actualResult;
            } else if (!expectedResult.equals(actualResult)) {
                throw error(LOGIC_ERROR, "INCONSISTENT_RESULTS",
                        "同一输入下排序算法返回了不一致的结果",
                        algorithm, null, Map.of());
            }
            results.add(new AlgorithmComparisonResponse.ComparisonResult(
                    trace.algorithm(), trace.category(), trace.result(),
                    trace.metrics(), trace.complexity()));
        }

        return new AlgorithmComparisonResponse(
                List.copyOf(request.getArray()),
                true,
                List.of(
                        "耗时包含教学轨迹生成，是单次服务端测量，受 JVM 预热和执行顺序影响，不代表严格基准测试结果。",
                        "步骤数包含教学事件；操作计数沿用各算法的埋点口径，不能将交换次数等同于总工作量。",
                        "空间复杂度表示算法本身的最坏辅助空间（含递归栈），不包括输入副本和轨迹快照。"),
                results);
    }

    public List<String> supportedAlgorithms() {
        List<String> result = new ArrayList<>(SORT_ALGORITHMS);
        result.addAll(SEARCH_ALGORITHMS);
        return result.stream().sorted().toList();
    }

    private AlgorithmTraceResponse traceSort(String algorithm, List<Integer> input) {
        long startedAt = System.nanoTime();
        List<SortStep> rawSteps = sortingService.generateSteps(algorithm, input);
        long elapsed = System.nanoTime() - startedAt;

        List<AlgorithmTraceResponse.TraceStep> steps = new ArrayList<>(rawSteps.size());
        for (int index = 0; index < rawSteps.size(); index++) {
            SortStep step = rawSteps.get(index);
            Map<String, Object> snapshot = new LinkedHashMap<>();
            snapshot.put("array", step.getArray());
            snapshot.put("comparing", step.getComparing());
            snapshot.put("swapping", step.getSwapping());
            snapshot.put("sorted", step.getSorted());
            snapshot.put("pivot", step.getPivot());
            snapshot.put("rangeLeft", step.getRangeLeft());
            snapshot.put("rangeRight", step.getRangeRight());
            snapshot.put("mergeLeft", step.getMergeLeft());
            snapshot.put("mergeRight", step.getMergeRight());
            snapshot.put("mergeTarget", step.getMergeTarget());
            steps.add(new AlgorithmTraceResponse.TraceStep(
                    index + 1,
                    step.getPhase(),
                    step.getCodeLine(),
                    snapshot,
                    step.getDescription(),
                    new AlgorithmTraceResponse.Metrics(
                            index + 1, step.getComparisons(), step.getSwaps(),
                            step.getAccesses(), 0)));
        }

        SortStep last = rawSteps.get(rawSteps.size() - 1);
        return new AlgorithmTraceResponse(
                algorithm,
                "sorting",
                List.copyOf(input),
                last.getArray(),
                steps,
                new AlgorithmTraceResponse.Metrics(
                        rawSteps.size(), last.getComparisons(), last.getSwaps(),
                        last.getAccesses(), elapsed),
                complexityOf(algorithm));
    }

    private AlgorithmTraceResponse traceBinarySearch(String algorithm, List<Integer> input,
                                                      Integer target) {
        if (target == null) {
            throw error(INVALID_INPUT, "TARGET_REQUIRED",
                    "二分查找必须提供 target", algorithm, 1, Map.of());
        }
        for (int i = 1; i < input.size(); i++) {
            if (input.get(i - 1) > input.get(i)) {
                throw error(PRECONDITION_NOT_MET, "ARRAY_NOT_SORTED",
                        "二分查找要求输入数组按升序排列", algorithm, 1,
                        Map.of("leftIndex", i - 1, "rightIndex", i,
                                "leftValue", input.get(i - 1), "rightValue", input.get(i)));
            }
        }

        long startedAt = System.nanoTime();
        List<SearchStep> rawSteps = searchService.generateSteps(algorithm, input, target);
        long elapsed = System.nanoTime() - startedAt;
        List<AlgorithmTraceResponse.TraceStep> steps = new ArrayList<>(rawSteps.size());
        int foundIndex = -1;
        for (int index = 0; index < rawSteps.size(); index++) {
            SearchStep step = rawSteps.get(index);
            if (Boolean.TRUE.equals(step.getFound())) {
                foundIndex = step.getMid();
            }
            Map<String, Object> snapshot = new LinkedHashMap<>();
            snapshot.put("array", step.getArray());
            snapshot.put("left", step.getLeft());
            snapshot.put("right", step.getRight());
            snapshot.put("mid", step.getMid());
            snapshot.put("target", step.getTarget());
            snapshot.put("found", step.getFound());
            snapshot.put("eliminated", step.getEliminated());
            steps.add(new AlgorithmTraceResponse.TraceStep(
                    index + 1,
                    step.getPhase(),
                    step.getCodeLine(),
                    snapshot,
                    step.getDescription(),
                    new AlgorithmTraceResponse.Metrics(
                            index + 1, step.getComparisons(), 0, 0, 0)));
        }

        SearchStep last = rawSteps.get(rawSteps.size() - 1);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("found", foundIndex >= 0);
        result.put("index", foundIndex);
        result.put("target", target);
        return new AlgorithmTraceResponse(
                algorithm,
                "search",
                List.copyOf(input),
                result,
                steps,
                new AlgorithmTraceResponse.Metrics(
                        rawSteps.size(), last.getComparisons(), 0, 0, elapsed),
                complexityOf(algorithm));
    }

    private String validateRequest(AlgorithmTraceRequest request) {
        if (request == null) {
            throw error(INVALID_INPUT, "REQUEST_REQUIRED",
                    "请求体不能为空", null, null, Map.of());
        }
        String algorithm = normalizeAlgorithm(request.getAlgorithm());
        if (algorithm.isBlank()) {
            throw error(INVALID_INPUT, "ALGORITHM_REQUIRED",
                    "算法名称不能为空", null, null, Map.of());
        }
        validateArray(request.getArray(), algorithm);
        return algorithm;
    }

    private void validateArray(List<Integer> array, String algorithm) {
        if (array == null) {
            throw error(INVALID_INPUT, "ARRAY_REQUIRED",
                    "输入数组不能为空", algorithm, null, Map.of());
        }
        if (array.isEmpty()) {
            throw error(BOUNDARY_CONDITION, "EMPTY_ARRAY",
                    "输入数组至少需要一个元素", algorithm, null, Map.of());
        }
        if (array.size() > MAX_INPUT_SIZE) {
            throw error(BOUNDARY_CONDITION, "INPUT_TOO_LARGE",
                    "输入数组不能超过 " + MAX_INPUT_SIZE + " 个元素",
                    algorithm, null, Map.of("actualSize", array.size(), "maximumSize", MAX_INPUT_SIZE));
        }
        if (array.stream().anyMatch(java.util.Objects::isNull)) {
            throw error(INVALID_INPUT, "NULL_ARRAY_ELEMENT",
                    "输入数组不能包含 null", algorithm, null, Map.of());
        }
    }

    private String normalizeAlgorithm(String algorithm) {
        return algorithm == null ? "" : algorithm.trim().toLowerCase(Locale.ROOT);
    }

    private boolean isSupported(String algorithm) {
        return SORT_ALGORITHMS.contains(algorithm) || SEARCH_ALGORITHMS.contains(algorithm);
    }

    private String categoryOf(String algorithm) {
        return SORT_ALGORITHMS.contains(algorithm) ? "sorting" : "search";
    }

    private AlgorithmTraceResponse.ComplexityProfile complexityOf(String algorithm) {
        return switch (algorithm) {
            case "quick-sort" -> new AlgorithmTraceResponse.ComplexityProfile(
                    "O(n log n)", "O(n log n)", "O(n^2)", "O(n)");
            case "merge-sort" -> new AlgorithmTraceResponse.ComplexityProfile(
                    "O(n log n)", "O(n log n)", "O(n log n)", "O(n)");
            case "bubble-sort" -> new AlgorithmTraceResponse.ComplexityProfile(
                    "O(n)", "O(n^2)", "O(n^2)", "O(1)");
            case "heap-sort" -> new AlgorithmTraceResponse.ComplexityProfile(
                    "O(n log n)", "O(n log n)", "O(n log n)", "O(log n)");
            case "insertion-sort" -> new AlgorithmTraceResponse.ComplexityProfile(
                    "O(n)", "O(n^2)", "O(n^2)", "O(1)");
            case "binary-search" -> new AlgorithmTraceResponse.ComplexityProfile(
                    "O(1)", "O(log n)", "O(log n)", "O(1)");
            default -> throw error(INVALID_INPUT, "UNSUPPORTED_ALGORITHM",
                    "不支持的算法：" + algorithm, algorithm, null, Map.of());
        };
    }

    private AlgorithmTraceException error(AlgorithmTraceException.ErrorType type,
                                          String code, String message, String algorithm,
                                          Integer codeLine, Map<String, Object> details) {
        return new AlgorithmTraceException(type, code, message, algorithm, codeLine, details);
    }
}
