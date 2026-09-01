import { generatePaymentId, generateOrderId, generateSettlementId } from './formatters.js';
import { GROUND_TRUTH, PAYMENT_METHODS, PAYMENT_STATUSES } from './constants.js';

const INDIAN_NAMES = [
  'Aarav Sharma', 'Priya Patel', 'Vikram Singh', 'Ananya Desai', 'Rohan Mehta', 
  'Sneha Gupta', 'Arjun Reddy', 'Kavitha Nair', 'Rahul Kumar', 'Deepika Iyer', 
  'Amit Joshi', 'Pooja Bhatt', 'Sanjay Verma', 'Neha Kapoor', 'Rajesh Pillai', 
  'Divya Agarwal', 'Karthik Menon', 'Swati Mishra', 'Manoj Tiwari', 'Lakshmi Rao'
];

export const getDataDistribution = () => ({
  NORMAL: { percentage: 70, status: GROUND_TRUTH.MATCHED },
  FEE_DISCREPANCY: { percentage: 10, status: GROUND_TRUTH.FEE_DISCREPANCY },
  REFUND_DISCREPANCY: { percentage: 5, status: GROUND_TRUTH.REFUND_DISCREPANCY },
  ADJUSTMENT_DISCREPANCY: { percentage: 5, status: GROUND_TRUTH.ADJUSTMENT_DISCREPANCY },
  MISSING_SETTLEMENT: { percentage: 4, status: GROUND_TRUTH.MISSING_SETTLEMENT },
  DUPLICATE: { percentage: 3, status: GROUND_TRUTH.DUPLICATE },
  UNEXPLAINED: { percentage: 2, status: GROUND_TRUTH.UNKNOWN },
  INVALID: { percentage: 1, status: GROUND_TRUTH.INVALID }
});

// Simple seeded random generator for deterministic output
const createRandom = (seed) => {
  let value = seed;
  return function() {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
};

export const generateSyntheticData = (count = 100) => {
  const payments = [];
  const settlements = [];
  const groundTruth = [];
  
  const rng = createRandom(12345);
  
  const dist = getDataDistribution();
  const getCount = (percentage) => Math.floor(count * (percentage / 100));
  
  const counts = {
    NORMAL: getCount(dist.NORMAL.percentage),
    FEE_DISCREPANCY: getCount(dist.FEE_DISCREPANCY.percentage),
    REFUND_DISCREPANCY: getCount(dist.REFUND_DISCREPANCY.percentage),
    ADJUSTMENT_DISCREPANCY: getCount(dist.ADJUSTMENT_DISCREPANCY.percentage),
    MISSING_SETTLEMENT: getCount(dist.MISSING_SETTLEMENT.percentage),
    DUPLICATE: getCount(dist.DUPLICATE.percentage),
    UNEXPLAINED: getCount(dist.UNEXPLAINED.percentage),
    INVALID: getCount(dist.INVALID.percentage)
  };
  
  // Adjust the first category to make up for rounding errors
  const totalAllocated = Object.values(counts).reduce((a, b) => a + b, 0);
  counts.NORMAL += (count - totalAllocated);

  let currentId = 1;
  const now = new Date();

  // Helper to get random item from array
  const getRandomItem = (arr) => arr[Math.floor(rng() * arr.length)];
  
  // Helper to get random amount between min and max
  const getRandomAmount = (min, max) => Math.floor(rng() * (max - min + 1)) + min;

  // Generate data based on distribution
  Object.keys(counts).forEach(category => {
    for (let i = 0; i < counts[category]; i++) {
      const idx = currentId++;
      
      const paymentId = generatePaymentId(idx);
      const orderId = generateOrderId(idx);
      const settlementId = generateSettlementId(idx);
      
      let amount = getRandomAmount(500, 50000);
      let status = 'captured';
      
      let fee = Math.round(amount * 0.02);
      let tax = Math.round(fee * 0.18);
      let adjustment = 0;
      let refund = 0;
      
      let gtStatus = dist[category].status;
      
      // Ensure one deliberate failure scenario (Section 31)
      if (category === 'UNEXPLAINED' && i === 0) {
        amount = 5000;
        fee = 100;
        tax = 18;
        adjustment = 0;
        refund = 0;
        gtStatus = GROUND_TRUTH.UNKNOWN;
      }
      
      if (category === 'REFUND_DISCREPANCY') {
        refund = getRandomAmount(100, Math.min(amount / 2, 5000));
        if (rng() > 0.5) status = 'refunded';
      }
      
      if (category === 'ADJUSTMENT_DISCREPANCY') {
        adjustment = getRandomAmount(-500, 500);
      }
      
      const payment = {
        id: `uuid-pay-${idx}`,
        payment_id: paymentId,
        order_id: orderId,
        amount: amount,
        currency: 'INR',
        status: status,
        customer_name: getRandomItem(INDIAN_NAMES),
        payment_method: getRandomItem(PAYMENT_METHODS),
        created_at: new Date(now.getTime() - (rng() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
        metadata: {},
        ground_truth_status: gtStatus
      };
      
      payments.push(payment);
      
      // Calculate valid net amount
      let expectedNet = amount - fee - tax + adjustment - refund;
      let actualNet = expectedNet;
      
      // Introduce discrepancies
      if (category === 'FEE_DISCREPANCY') actualNet = expectedNet + getRandomAmount(10, 100);
      else if (category === 'REFUND_DISCREPANCY') actualNet = expectedNet + refund; // Missing refund
      else if (category === 'ADJUSTMENT_DISCREPANCY') actualNet = expectedNet - adjustment; // Missing adjustment
      else if (category === 'UNEXPLAINED') {
        if (i === 0) {
          actualNet = 4500; // Expected 4882
        } else {
          actualNet = expectedNet + getRandomAmount(100, 1000);
        }
      }
      
      const settlement = {
        id: `uuid-set-${idx}`,
        settlement_id: settlementId,
        payment_id: paymentId,
        gross_amount: amount,
        fee: fee,
        tax: tax,
        adjustment: adjustment,
        refund: refund,
        net_amount: actualNet,
        status: 'settled',
        settled_at: new Date(new Date(payment.created_at).getTime() + (rng() * 3 * 24 * 60 * 60 * 1000)).toISOString(),
        metadata: {}
      };

      if (category === 'INVALID') {
        settlement.net_amount = null;
        settlement.gross_amount = -100;
        payment.status = 'failed';
      }

      if (category !== 'MISSING_SETTLEMENT') {
        settlements.push(settlement);
        if (category === 'DUPLICATE') {
          settlements.push({
            ...settlement,
            id: `uuid-set-dup-${idx}`,
            settled_at: new Date(new Date(settlement.settled_at).getTime() + 1000).toISOString()
          });
        }
      }
      
      groundTruth.push({
        payment_id: paymentId,
        expected_status: gtStatus
      });
    }
  });
  
  return { payments, settlements, groundTruth };
};
