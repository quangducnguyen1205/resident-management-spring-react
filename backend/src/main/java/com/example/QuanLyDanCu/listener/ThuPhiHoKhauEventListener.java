package com.example.QuanLyDanCu.listener;

import com.example.QuanLyDanCu.event.ChangeOperation;
import com.example.QuanLyDanCu.event.HoKhauChangedEvent;
import com.example.QuanLyDanCu.event.NhanKhauChangedEvent;
import com.example.QuanLyDanCu.service.ThuPhiHoKhauService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Event listener for automatic fee recalculation when household or citizen data changes.
 * 
 * This listener responds to:
 * - HoKhauChangedEvent: When a household is created, updated, or deleted
 * - NhanKhauChangedEvent: When a citizen is created, updated, or deleted
 * 
 * All operations are executed AFTER_COMMIT to ensure database consistency.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ThuPhiHoKhauEventListener {

    private final ThuPhiHoKhauService thuPhiHoKhauService;

    /**
     * Handle HoKhau (household) changes.
     * 
     * - CREATE: Auto-create initial ThuPhiHoKhau record
     * - UPDATE: Recalculate fees (in case household data affects calculation)
     * - DELETE: Cascade delete all ThuPhiHoKhau records
     * 
     * Runs in a NEW transaction to ensure DB updates persist after the original transaction commits.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleHoKhauChanged(HoKhauChangedEvent event) {
        log.info("=== Received HoKhauChangedEvent: {} ===", event);
        log.info("=== Starting NEW transaction for fee recalculation ===");
        
        Long hoKhauId = event.getHoKhauId();
        ChangeOperation operation = event.getOperation();
        
        try {
            switch (operation) {
                case CREATE:
                    log.info("Household {} created. Creating initial fee record...", hoKhauId);
                    thuPhiHoKhauService.createInitialFeeRecord(hoKhauId);
                    log.info("✓ Initial fee record created and COMMITTED to DB for household {}", hoKhauId);
                    break;
                    
                case UPDATE:
                    log.info("Household {} updated. Recalculating fees...", hoKhauId);
                    thuPhiHoKhauService.recalculateForHousehold(hoKhauId);
                    log.info("✓ Fee recalculation completed and COMMITTED to DB for household {}", hoKhauId);
                    break;
                    
                case DELETE:
                    log.info("Household {} deleted. Cascade deleting fee records...", hoKhauId);
                    thuPhiHoKhauService.deleteAllForHousehold(hoKhauId);
                    log.info("✓ Fee records deleted and COMMITTED to DB for household {}", hoKhauId);
                    break;
                    
                default:
                    log.warn("Unknown operation type: {}", operation);
            }
        } catch (Exception e) {
            log.error("❌ Error handling HoKhauChangedEvent for household {}: {}", 
                      hoKhauId, e.getMessage(), e);
            // Rethrow to trigger transaction rollback
            throw new RuntimeException("Fee recalculation failed for household " + hoKhauId, e);
        }
    }

    /**
     * Handle NhanKhau (citizen) changes.
     * 
     * All operations trigger fee recalculation for the affected household:
     * - CREATE: New member added → increase fee
     * - UPDATE: Member data changed (e.g., tam_vang status) → recalculate fee
     * - DELETE: Member removed → decrease fee
     * 
     * Runs in a NEW transaction to ensure DB updates persist after the original transaction commits.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleNhanKhauChanged(NhanKhauChangedEvent event) {
        log.info("=== Received NhanKhauChangedEvent: {} ===", event);
        log.info("=== Starting NEW transaction for fee recalculation ===");
        
        Long nhanKhauId = event.getNhanKhauId();
        Long hoKhauId = event.getHoKhauId();
        ChangeOperation operation = event.getOperation();
        
        try {
            log.info("Citizen {} {} in household {}. Recalculating fees...", 
                     nhanKhauId, operation.toString().toLowerCase(), hoKhauId);
            
            thuPhiHoKhauService.recalculateForHousehold(hoKhauId);
            
            log.info("✓ Fee recalculation completed and COMMITTED to DB for household {} after citizen {} {}", 
                     hoKhauId, nhanKhauId, operation.toString().toLowerCase());
            
        } catch (Exception e) {
            log.error("❌ Error handling NhanKhauChangedEvent for citizen {} in household {}: {}", 
                      nhanKhauId, hoKhauId, e.getMessage(), e);
            // Rethrow to trigger transaction rollback
            throw new RuntimeException("Fee recalculation failed for household " + hoKhauId, e);
        }
    }
}
