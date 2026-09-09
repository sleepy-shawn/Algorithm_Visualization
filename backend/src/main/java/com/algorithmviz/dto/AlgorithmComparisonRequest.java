package com.algorithmviz.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class AlgorithmComparisonRequest {

    @NotNull(message = "算法列表不能为空")
    @Size(min = 2, max = 10, message = "请选择 2 到 10 个算法进行对比")
    private List<@NotBlank(message = "算法名称不能为空") String> algorithms;

    @NotNull(message = "输入数组不能为空")
    private List<@NotNull(message = "数组元素不能为空") Integer> array;

    private Integer target;

    public List<String> getAlgorithms() { return algorithms; }
    public void setAlgorithms(List<String> algorithms) { this.algorithms = algorithms; }
    public List<Integer> getArray() { return array; }
    public void setArray(List<Integer> array) { this.array = array; }
    public Integer getTarget() { return target; }
    public void setTarget(Integer target) { this.target = target; }
}
