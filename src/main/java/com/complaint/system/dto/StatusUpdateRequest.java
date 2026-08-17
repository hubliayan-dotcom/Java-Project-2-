package com.complaint.system.dto;

import com.complaint.system.model.Status;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(
    @NotNull(message = "New status is required")
    Status newStatus,

    String resolution,
    String comment
) {}
