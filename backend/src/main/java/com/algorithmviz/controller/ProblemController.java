package com.algorithmviz.controller;

import com.algorithmviz.entity.Problem;
import com.algorithmviz.entity.ProblemCategory;
import com.algorithmviz.entity.ProblemSolution;
import com.algorithmviz.service.ProblemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Hot 100 题库 REST 接口。
 *
 * GET /api/categories                          全部分类
 * GET /api/problems                            全部题目
 * GET /api/problems?category=dp                按分类筛选
 * GET /api/problems?difficulty=EASY            按难度筛选
 * GET /api/problems?visualizerType=graph       按可视化类型筛选
 * GET /api/problems/{slug}                     题目详情（含全部题解）
 */
@RestController
@RequestMapping("/api")
public class ProblemController {

    private final ProblemService problemService;

    public ProblemController(ProblemService problemService) {
        this.problemService = problemService;
    }

    @GetMapping("/categories")
    public List<ProblemCategory> categories() {
        return problemService.listCategories();
    }

    @GetMapping("/problems")
    public List<Problem> problems(@RequestParam(required = false) String category,
                                  @RequestParam(required = false) String difficulty,
                                  @RequestParam(required = false) String visualizerType) {
        return problemService.listProblems(category, difficulty, visualizerType);
    }

    @GetMapping("/problems/{slug}")
    public ResponseEntity<Map<String, Object>> problemDetail(@PathVariable String slug) {
        Problem problem = problemService.getProblem(slug);
        if (problem == null) {
            return ResponseEntity.notFound().build();
        }
        List<ProblemSolution> solutions = problemService.listSolutions(problem.getId());
        return ResponseEntity.ok(Map.of(
                "problem", problem,
                "solutions", solutions
        ));
    }
}
