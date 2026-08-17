package com.complaint.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentRequest(
    @NotBlank(message = "Comment message cannot be empty")
    @Size(min = 2, max = 1000, message = "Comment must be between 2 and 1000 characters")
    String message
) {}
