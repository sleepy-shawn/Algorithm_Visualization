package com.algorithmviz.repository;

import com.algorithmviz.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProblemRepository extends JpaRepository<Problem, Long> {

    Optional<Problem> findBySlug(String slug);

    /** 全部题目，按序号排序 */
    List<Problem> findAllByOrderByOrderIndexAsc();

    /** 按分类查题目（方法名即查询，JPA 自动解析） */
    List<Problem> findByCategoryIdOrderByOrderIndexAsc(Long categoryId);

    /** 按难度查题目 */
    List<Problem> findByDifficultyOrderByOrderIndexAsc(String difficulty);

    /** 按可视化类型查题目 */
    List<Problem> findByVisualizerTypeOrderByOrderIndexAsc(String visualizerType);
}
