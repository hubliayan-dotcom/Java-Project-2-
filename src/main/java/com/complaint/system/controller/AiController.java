package com.complaint.system.controller;

import com.complaint.system.dto.AiCategorizeRequest;
import com.complaint.system.dto.AiCategorizeResponse;
import com.complaint.system.service.AiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Gemini AI Complaint Auto-Categorization and Smart Triage.
 */
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/categorize")
    public ResponseEntity<AiCategorizeResponse> categorize(@Valid @RequestBody AiCategorizeRequest request) {
        AiCategorizeResponse response = aiService.categorize(request);
        return ResponseEntity.ok(response);
    }
}
