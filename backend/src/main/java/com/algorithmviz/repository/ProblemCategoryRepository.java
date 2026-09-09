package com.algorithmviz.repository;

import com.algorithmviz.entity.ProblemCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProblemCategoryRepository extends JpaRepository<ProblemCategory, Long> {

    /** 根据英文标识查分类，如 findBySlug("dp") */
    Optional<ProblemCategory> findBySlug(String slug);
}
