import { VoucherType, type Voucher, type CaseStatus } from "@takehome/common";

export function calculateCaseStatus(caseId: string, vouchers: Voucher[]): CaseStatus {

  type Bucket = {
    principalVoucherId: string;
    principalVoucherDate: string;
    originalPrincipal: number;
    principal: number;
    interest: number;
    annualRate: number;
    hasAnnualRate: boolean;
    lastAccruedDay: number;
  };

  const relevantVouchers = getSortedVouchers(vouchers, caseId);

  const buckets = new Map<string, Bucket>();
  const bucketOrder: string[] = [];

  const accrueBucket = (bucket: Bucket, targetDay: number) => { // Accrue interest for bucket up to the target day
    const elapsedDays = daysBetween(bucket.lastAccruedDay, targetDay);
    if (elapsedDays > 0 && bucket.principal > 0 && bucket.annualRate > 0) {
      bucket.interest = bucket.interest + bucket.principal * bucket.annualRate * (elapsedDays / 365);
    }
    bucket.lastAccruedDay = targetDay;
  };

  const applyPayment = (paymentAmount: number) => { //Creates payment and applies it to interest and principal in order
    let remaining = paymentAmount;

    for (const principalVoucherId of bucketOrder) {
      if (remaining <= 0) {
        break;
      }

      const bucket = buckets.get(principalVoucherId);
      if (bucket == null) {
        continue;
      }

      const interestPaid = Math.min(bucket.interest, remaining);
      bucket.interest = bucket.interest - interestPaid;
      remaining = remaining - interestPaid;

      if (remaining <= 0) {
        break;
      }

      const principalPaid = Math.min(bucket.principal, remaining);
      bucket.principal = bucket.principal - principalPaid;
      remaining = remaining - principalPaid;
    }
  };

  for (const voucher of relevantVouchers) {
    const voucherDay = toDay(voucher.date);

    for (const bucket of buckets.values()) {
      accrueBucket(bucket, voucherDay);
    }

    if (voucher.type_id === VoucherType.Principal) { //Adds new principal to bucket
      const principalVoucherId = voucher.id;
      buckets.set(principalVoucherId, {
        principalVoucherId,
        principalVoucherDate: voucher.date,
        originalPrincipal: roundMoney(safeNumber(voucher.amount)),
        principal: roundMoney(safeNumber(voucher.amount)),
        interest: 0,
        annualRate: 0,
        hasAnnualRate: false,
        lastAccruedDay: voucherDay,
      });
      bucketOrder.push(principalVoucherId);
      continue;
    }

    if (voucher.type_id === VoucherType.Interest && voucher.reference_voucher_id != null) { //Set annual interest rate for specific principal voucher
      const bucket = buckets.get(voucher.reference_voucher_id);
      if (bucket != null && voucher.annual_interest_rate != null) {
        bucket.annualRate = safeNumber(voucher.annual_interest_rate) / 100;
        bucket.hasAnnualRate = true;
      }
      continue;
    }

    if (voucher.type_id === VoucherType.Payment) {
      applyPayment(Math.abs(safeNumber(voucher.amount)));
    }
  }

  const now = new Date();
  const todayDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  for (const bucket of buckets.values()) {
    accrueBucket(bucket, todayDay);
  }

  const principal = roundMoney(Array.from(buckets.values()).reduce((sum, bucket) => sum + bucket.principal, 0));
  const interest = roundMoney(Array.from(buckets.values()).reduce((sum, bucket) => sum + bucket.interest, 0));
  const byPrincipal = bucketOrder
    .map((principalVoucherId) => buckets.get(principalVoucherId))
    .filter((bucket): bucket is Bucket => bucket != null)
    .map((bucket) => {
      const principalPaid = roundMoney(bucket.originalPrincipal - bucket.principal);
      return {
        principal_voucher_id: bucket.principalVoucherId,
        principal_voucher_date: bucket.principalVoucherDate,
        annual_interest_rate: bucket.hasAnnualRate ? roundMoney(bucket.annualRate * 100) : null,
        original_principal: bucket.originalPrincipal,
        principal_paid: principalPaid,
        remaining_principal: roundMoney(bucket.principal),
        accrued_interest: roundMoney(bucket.interest),
        total: roundMoney(bucket.principal + bucket.interest),
      };
    });

  return {
    case_id: caseId,
    principal,
    interest,
    total: roundMoney(principal + interest),
    by_principal: byPrincipal,
  };
}

function safeNumber(value: unknown) {
  return Number(value ?? 0);
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function toDay(value: string) {
  const date = new Date(value);
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(from: number, to: number) {
  return Math.max(0, Math.floor((to - from) / 86_400_000));
}

function getSortedVouchers(vouchers: Voucher[], caseId: string): Voucher[] {

  return vouchers
    .filter((voucher) => voucher.case_id === caseId)
    .slice()
    .sort((left, right) => {
      const dateDiff = toDay(left.date) - toDay(right.date);
      if (dateDiff !== 0) {
        return dateDiff;
      }

      const typeOrder = (typeId: VoucherType) => {
        switch (typeId) {
          case VoucherType.Principal:
            return 0;
          case VoucherType.Interest:
            return 1;
          case VoucherType.Payment:
            return 2;
        }
      };

      const typeDiff = typeOrder(left.type_id) - typeOrder(right.type_id);
      if (typeDiff !== 0) {
        return typeDiff;
      }

      return new Date(left.created_at).getTime() - new Date(right.created_at).getTime();
    });

}