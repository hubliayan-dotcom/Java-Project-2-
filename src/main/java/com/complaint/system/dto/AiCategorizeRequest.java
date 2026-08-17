package com.complaint.system.dto;

import jakarta.validation.constraints.NotBlank;

public record AiCategorizeRequest(
    @NotBlank(message = "Title is required")
    String title,

    @NotBlank(message = "Description is required")
    String description
) {}
