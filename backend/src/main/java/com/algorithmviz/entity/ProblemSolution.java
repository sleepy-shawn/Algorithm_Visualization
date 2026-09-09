package com.algorithmviz.entity;

import jakarta.persistence.*;

/**
 * 题解（一道题可以有多种解法）
 * 对应数据表：problem_solution
 */
@Entity
@Table(name = "problem_solution")
public class ProblemSolution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 所属题目 */
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "problem_id", foreignKey = @ForeignKey(name = "fk_solution_problem"))
    private Problem problem;

    /** 解法名称，如 "哈希表一次遍历" */
    @Column(name = "approach_name", nullable = false, length = 100)
    private String approachName;

    /** 解题思路（用自己的话讲清楚为什么这么做） */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    /** Java 参考代码 */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String code;

    @Column(name = "time_complexity", length = 50)
    private String timeComplexity;

    @Column(name = "space_complexity", length = 50)
    private String spaceComplexity;

    /** 同一道题内多个解法的排序 */
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    public Long getId() { return id; }
    public Problem getProblem() { return problem; }
    public void setProblem(Problem problem) { this.problem = problem; }
    public String getApproachName() { return approachName; }
    public void setApproachName(String approachName) { this.approachName = approachName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getTimeComplexity() { return timeComplexity; }
    public void setTimeComplexity(String timeComplexity) { this.timeComplexity = timeComplexity; }
    public String getSpaceComplexity() { return spaceComplexity; }
    public void setSpaceComplexity(String spaceComplexity) { this.spaceComplexity = spaceComplexity; }
    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
}
