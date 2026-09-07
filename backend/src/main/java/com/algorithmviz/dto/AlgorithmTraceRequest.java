package com.algorithmviz.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class AlgorithmTraceRequest {

    @NotBlank(message = "算法名称不能为空")
    private String algorithm;

    @NotNull(message = "输入数组不能为空")
    private List<@NotNull(message = "数组元素不能为空") Integer> array;

    private Integer target;

    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }
    public List<Integer> getArray() { return array; }
    public void setArray(List<Integer> array) { this.array = array; }
    public Integer getTarget() { return target; }
    public void setTarget(Integer target) { this.target = target; }
}
