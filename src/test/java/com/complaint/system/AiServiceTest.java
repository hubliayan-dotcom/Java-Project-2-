package com.complaint.system;

import com.complaint.system.dto.AiCategorizeRequest;
import com.complaint.system.dto.AiCategorizeResponse;
import com.complaint.system.model.Category;
import com.complaint.system.model.Priority;
import com.complaint.system.service.AiService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("AI Triage & Auto-Categorization Test Suite")
class AiServiceTest {

    private AiService aiService;

    @BeforeEach
    void setUp() {
        aiService = new AiService();
    }

    @Test
    @DisplayName("Should detect billing issues and assign HIGH priority")
    void detectsBillingCategory() {
        AiCategorizeRequest req = new AiCategorizeRequest(
                "Incorrect credit card charge",
                "I was charged twice for invoice #4402 on my monthly subscription bill."
        );

        AiCategorizeResponse res = aiService.categorizeComplaint(req);

        assertEquals(Category.BILLING, res.category());
        assertEquals(Priority.HIGH, res.priority());
        assertNotNull(res.suggestedTags());
        assertFalse(res.suggestedTags().isEmpty());
    }

    @Test
    @DisplayName("Should detect server outage and assign CRITICAL priority")
    void detectsCriticalInfrastructure() {
        AiCategorizeRequest req = new AiCategorizeRequest(
                "Production database cluster down",
                "Complete emergency outage on primary database node. All API traffic failing."
        );

        AiCategorizeResponse res = aiService.categorizeComplaint(req);

        assertEquals(Category.INFRASTRUCTURE, res.category());
        assertEquals(Priority.CRITICAL, res.priority());
        assertEquals(4, res.estimatedResolutionHours());
    }
}
