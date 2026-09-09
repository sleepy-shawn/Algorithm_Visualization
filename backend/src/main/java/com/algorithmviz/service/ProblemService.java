package com.algorithmviz.service;

import com.algorithmviz.entity.Problem;
import com.algorithmviz.entity.ProblemCategory;
import com.algorithmviz.entity.ProblemSolution;
import com.algorithmviz.repository.ProblemCategoryRepository;
import com.algorithmviz.repository.ProblemRepository;
import com.algorithmviz.repository.ProblemSolutionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 题库业务逻辑：查询分类、题目列表（支持筛选）、题目详情（含题解）。
 */
@Service
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final ProblemCategoryRepository categoryRepository;
    private final ProblemSolutionRepository solutionRepository;

    public ProblemService(ProblemRepository problemRepository,
                          ProblemCategoryRepository categoryRepository,
                          ProblemSolutionRepository solutionRepository) {
        this.problemRepository = problemRepository;
        this.categoryRepository = categoryRepository;
        this.solutionRepository = solutionRepository;
    }

    /** 全部分类 */
    public List<ProblemCategory> listCategories() {
        return categoryRepository.findAll();
    }

    /**
     * 题目列表，三个筛选条件都是可选的：
     * categorySlug（如 "dp"）、difficulty（如 "EASY"）、visualizerType（如 "graph"）
     */
    public List<Problem> listProblems(String categorySlug, String difficulty, String visualizerType) {
        if (categorySlug != null && !categorySlug.isBlank()) {
            return categoryRepository.findBySlug(categorySlug)
                    .map(cat -> problemRepository.findByCategoryIdOrderByOrderIndexAsc(cat.getId()))
                    .orElse(List.of());
        }
        if (difficulty != null && !difficulty.isBlank()) {
            return problemRepository.findByDifficultyOrderByOrderIndexAsc(difficulty.toUpperCase());
        }
        if (visualizerType != null && !visualizerType.isBlank()) {
            return problemRepository.findByVisualizerTypeOrderByOrderIndexAsc(visualizerType);
        }
        return problemRepository.findAllByOrderByOrderIndexAsc();
    }

    /** 单道题目 */
    public Problem getProblem(String slug) {
        return problemRepository.findBySlug(slug).orElse(null);
    }

    /** 某道题的全部题解 */
    public List<ProblemSolution> listSolutions(Long problemId) {
        return solutionRepository.findByProblemIdOrderByOrderIndexAsc(problemId);
    }
}
