package com.algorithmviz.repository;

import com.algorithmviz.entity.ProblemSolution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProblemSolutionRepository extends JpaRepository<ProblemSolution, Long> {

    /** 查某道题的全部题解，按序号排序 */
    List<ProblemSolution> findByProblemIdOrderByOrderIndexAsc(Long problemId);
}
