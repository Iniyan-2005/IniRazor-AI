import { RECON_STATUS, DEFAULT_CONFIG } from '../utils/constants.js';
import { generateId } from '../utils/formatters.js';

export const calculateExpectedNet = (settlement) => {
  return settlement.gross_amount - settlement.fee - settlement.tax + settlement.adjustment - settlement.refund;
};

export const classifyDifference = (payment, settlement, difference, config = DEFAULT_CONFIG) => {
  const tolerance = config.TOLERANCE_AMOUNT || config.tolerance || 1.0;
  if (Math.abs(difference) <= tolerance) return RECON_STATUS.MATCHED;

  // Fee discrepancy
  if (Math.abs(difference - settlement.fee) <= tolerance || Math.abs(difference + settlement.fee) <= tolerance) {
    return RECON_STATUS.FEE_DISCREPANCY;
  }
  
  // Tax discrepancy
  if (Math.abs(difference - settlement.tax) <= tolerance || Math.abs(difference + settlement.tax) <= tolerance) {
    return RECON_STATUS.TAX_DISCREPANCY;
  }
  
  // Refund discrepancy
  if (settlement.refund > 0 && (Math.abs(difference - settlement.refund) <= tolerance || Math.abs(difference + settlement.refund) <= tolerance)) {
    return RECON_STATUS.REFUND_DISCREPANCY;
  }
  
  // Adjustment discrepancy
  if (settlement.adjustment !== 0 && (Math.abs(difference - settlement.adjustment) <= tolerance || Math.abs(difference + settlement.adjustment) <= tolerance)) {
    return RECON_STATUS.ADJUSTMENT_DISCREPANCY;
  }
  
  return RECON_STATUS.AMOUNT_MISMATCH;
};

export const reconcilePayment = (payment, settlements, config = DEFAULT_CONFIG) => {
  const matchingSettlements = settlements.filter(s => s.payment_id === payment.payment_id);
  
  const baseRecord = {
    id: generateId(),
    payment_id: payment.payment_id,
    expected_amount: payment.amount,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    _isDeterministic: true,
    ai_analysis: null,
    final_action: null
  };

  if (matchingSettlements.length === 0) {
    return {
      ...baseRecord,
      settlement_id: null,
      actual_amount: 0,
      difference: payment.amount,
      status: RECON_STATUS.MISSING_SETTLEMENT,
      confidence: 1.0,
      reason: 'No corresponding settlement found for payment.',
      recommended_action: 'NEEDS_REVIEW'
    };
  }

  if (matchingSettlements.length > 1) {
    return {
      ...baseRecord,
      settlement_id: matchingSettlements.map(s => s.settlement_id).join(','),
      actual_amount: matchingSettlements.reduce((sum, s) => sum + s.net_amount, 0),
      difference: null,
      status: RECON_STATUS.DUPLICATE,
      confidence: 1.0,
      reason: `Found ${matchingSettlements.length} settlements for the same payment.`,
      recommended_action: 'NEEDS_REVIEW'
    };
  }

  const settlement = matchingSettlements[0];
  const expectedNet = calculateExpectedNet(settlement);
  const actualNet = settlement.net_amount;
  const difference = expectedNet - actualNet;

  let status = RECON_STATUS.MATCHED;
  let reason = 'Payment and settlement match.';
  let confidence = 1.0;
  let recommendedAction = null;

  if (payment.status === 'failed' || actualNet === null || isNaN(actualNet)) {
    status = RECON_STATUS.INVALID;
    reason = 'Invalid payment or settlement data.';
    recommendedAction = 'NEEDS_REVIEW';
  } else {
    status = classifyDifference(payment, settlement, difference, config);
    if (status !== RECON_STATUS.MATCHED) {
      reason = `Discrepancy found: ${status}. Difference: ${difference}.`;
      recommendedAction = status === RECON_STATUS.AMOUNT_MISMATCH ? 'NEEDS_REVIEW' : 'AUTO_RESOLVE';
      if (status === RECON_STATUS.AMOUNT_MISMATCH) {
        confidence = 0.5;
        baseRecord._isDeterministic = false;
      }
    }
  }

  return {
    ...baseRecord,
    settlement_id: settlement.settlement_id,
    expected_amount: expectedNet,
    actual_amount: actualNet,
    difference: difference,
    status: status,
    confidence: confidence,
    reason: reason,
    recommended_action: recommendedAction
  };
};

export const reconcileBatch = (payments, settlements, config = DEFAULT_CONFIG) => {
  const startTime = performance.now();
  
  const reconciliations = payments.map(payment => reconcilePayment(payment, settlements, config));
  
  const stats = {
    total: reconciliations.length,
    matched: 0,
    feeDiscrepancy: 0,
    taxDiscrepancy: 0,
    refundDiscrepancy: 0,
    adjustmentDiscrepancy: 0,
    missingSettlement: 0,
    duplicate: 0,
    amountMismatch: 0,
    invalid: 0,
    needsAI: 0
  };

  reconciliations.forEach(r => {
    switch(r.status) {
      case RECON_STATUS.MATCHED: stats.matched++; break;
      case RECON_STATUS.FEE_DISCREPANCY: stats.feeDiscrepancy++; break;
      case RECON_STATUS.TAX_DISCREPANCY: stats.taxDiscrepancy++; break;
      case RECON_STATUS.REFUND_DISCREPANCY: stats.refundDiscrepancy++; break;
      case RECON_STATUS.ADJUSTMENT_DISCREPANCY: stats.adjustmentDiscrepancy++; break;
      case RECON_STATUS.MISSING_SETTLEMENT: stats.missingSettlement++; break;
      case RECON_STATUS.DUPLICATE: stats.duplicate++; break;
      case RECON_STATUS.AMOUNT_MISMATCH: stats.amountMismatch++; break;
      case RECON_STATUS.INVALID: stats.invalid++; break;
    }
    
    if (r.status === RECON_STATUS.AMOUNT_MISMATCH || !r._isDeterministic) {
      stats.needsAI++;
    }
  });

  const processingTime = performance.now() - startTime;

  return { reconciliations, stats, processingTime };
};
