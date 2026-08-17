package com.complaint.system.dto;

import com.complaint.system.model.Category;
import com.complaint.system.model.Priority;

import java.util.List;

public record AiCategorizeResponse(
    Category category,
    Priority priority,
    double confidenceScore,
    String reasoning,
    String suggestedResolutionPath,
    String summary,
    List<String> suggestedTags,
    int estimatedResolutionHours
) {
    public AiCategorizeResponse(Category category, Priority priority, String reasoning, String suggestedResolutionPath, String summary) {
        this(
            category,
            priority,
            0.95,
            reasoning,
            suggestedResolutionPath,
            summary,
            List.of(category.name().toLowerCase(), priority.name().toLowerCase(), "triaged"),
            priority == Priority.CRITICAL ? 4 : (priority == Priority.HIGH ? 12 : 24)
        );
    }
}
