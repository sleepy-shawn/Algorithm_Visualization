package com.algorithmviz.entity;

import jakarta.persistence.*;

/**
 * 题目分类（如：数组与哈希、链表、动态规划…）
 * 对应数据表：problem_category
 */
@Entity
@Table(name = "problem_category", uniqueConstraints = {
        @UniqueConstraint(name = "uk_category_slug", columnNames = "slug")
})
public class ProblemCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 分类名称，如 "动态规划" */
    @Column(nullable = false, length = 50)
    private String name;

    /** 英文标识，如 "dp"，用于 URL 和前端匹配 */
    @Column(nullable = false, length = 50)
    private String slug;

    /** 前端图标名（可选） */
    @Column(length = 50)
    private String icon;

    /** 排序序号，越小越靠前 */
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
}
