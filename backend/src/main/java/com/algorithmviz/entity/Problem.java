package com.algorithmviz.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 题目（Hot 100）
 * 对应数据表：problem
 */
@Entity
@Table(name = "problem", uniqueConstraints = {
        @UniqueConstraint(name = "uk_problem_slug", columnNames = "slug")
})
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 英文唯一标识，如 "two-sum" */
    @Column(nullable = false, length = 80)
    private String slug;

    /** 中文题目标题 */
    @Column(nullable = false, length = 100)
    private String title;

    /** 题面描述（自行整理，不搬运力扣原文） */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    /** 难度：EASY / MEDIUM / HARD */
    @Column(nullable = false, length = 10)
    private String difficulty;

    /** 所属分类 */
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "category_id", foreignKey = @ForeignKey(name = "fk_problem_category"))
    private ProblemCategory category;

    /** 标签，逗号分隔，如 "数组,哈希表" */
    @Column(length = 200)
    private String tags;

    /**
     * 可视化类型，对应前端 visualizers/ 目录下的组件：
     * sorting / search / graph / dp / backtracking / linkedlist / stack / binarytree / design
     * 暂无可视化组件的题目可为 null
     */
    @Column(name = "visualizer_type", length = 30)
    private String visualizerType;

    /** 最优解时间复杂度，如 "O(n)" */
    @Column(name = "time_complexity", length = 50)
    private String timeComplexity;

    /** 最优解空间复杂度，如 "O(n)" */
    @Column(name = "space_complexity", length = 50)
    private String spaceComplexity;

    /** 排序序号 */
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public ProblemCategory getCategory() { return category; }
    public void setCategory(ProblemCategory category) { this.category = category; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public String getVisualizerType() { return visualizerType; }
    public void setVisualizerType(String visualizerType) { this.visualizerType = visualizerType; }
    public String getTimeComplexity() { return timeComplexity; }
    public void setTimeComplexity(String timeComplexity) { this.timeComplexity = timeComplexity; }
    public String getSpaceComplexity() { return spaceComplexity; }
    public void setSpaceComplexity(String spaceComplexity) { this.spaceComplexity = spaceComplexity; }
    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
