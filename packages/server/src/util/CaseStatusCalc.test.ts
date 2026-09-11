import { afterEach, describe, expect, it, vi } from "vitest";
import { VoucherType, type Voucher } from "@takehome/common";
import { calculateCaseStatus } from "./CaseStatusCalc.js";

describe("calculateCaseStatus", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("accrues interest correctly, even with replaced interest rates", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-11T12:00:00.000Z"));

    const caseId = "11111111-1111-1111-1111-111111111111";
    const principalId = "22222222-2222-2222-2222-222222222222";
    const vouchers: Voucher[] = [
      {
        id: principalId,
        case_id: caseId,
        type_id: VoucherType.Principal,
        amount: 15000,
        annual_interest_rate: null,
        reference_voucher_id: null,
        date: "2025-01-15T00:00:00.000Z",
        created_at: "2026-09-11T12:00:00.000Z",
      },
      {
        id: "33333333-3333-3333-3333-333333333333",
        case_id: caseId,
        type_id: VoucherType.Interest,
        amount: 0,
        annual_interest_rate: 10,
        reference_voucher_id: principalId,
        date: "2026-09-01T00:00:00.000Z",
        created_at: "2026-09-11T12:00:00.000Z",
      },
      {
        id: "44444444-4444-4444-4444-444444444444",
        case_id: caseId,
        type_id: VoucherType.Interest,
        amount: 0,
        annual_interest_rate: 20,
        reference_voucher_id: principalId,
        date: "2026-09-06T00:00:00.000Z",
        created_at: "2026-09-11T12:00:00.000Z",
      },
    ];

    const status = calculateCaseStatus(caseId, vouchers);

    expect(status.principal).toBe(15000);
    expect(status.interest).toBe(61.64); 
    expect(status.total).toBe(15061.64);
  });

  it("applies payments to interest before principal", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-11T12:00:00.000Z"));

    const caseId = "11111111-1111-1111-1111-111111111111";
    const principalId = "22222222-2222-2222-2222-222222222222";
    const vouchers: Voucher[] = [
      {
        id: principalId,
        case_id: caseId,
        type_id: VoucherType.Principal,
        amount: 10000,
        annual_interest_rate: null,
        reference_voucher_id: null,
        date: "2025-01-01T00:00:00.000Z",
        created_at: "2026-09-11T12:00:00.000Z",
      },
      {
        id: "33333333-3333-3333-3333-333333333333",
        case_id: caseId,
        type_id: VoucherType.Interest,
        amount: 0,
        annual_interest_rate: 25,
        reference_voucher_id: principalId,
        date: "2026-09-01T00:00:00.000Z",
        created_at: "2026-09-11T12:00:00.000Z",
      },
      {
        id: "44444444-4444-4444-4444-444444444444",
        case_id: caseId,
        type_id: VoucherType.Payment,
        amount: -1000,
        annual_interest_rate: null,
        reference_voucher_id: null,
        date: "2026-09-01T12:00:00.000Z",
        created_at: "2026-09-11T12:00:00.000Z",
      },
      {
        id: "55555555-5555-5555-5555-555555555555",
        case_id: caseId,
        type_id: VoucherType.Payment,
        amount: -500,
        annual_interest_rate: null,
        reference_voucher_id: null,
        date: "2026-09-06T12:00:00.000Z",
        created_at: "2026-09-11T12:00:00.000Z",
      },
    ];

    const status = calculateCaseStatus(caseId, vouchers);

    expect(status.principal).toBe(8530.82);
    expect(status.interest).toBe(29.22);
    expect(status.total).toBe(8560.04);
    expect(status.by_principal[0].principal_paid).toBe(1469.18);
  });

  it("handles payment on case with multiple principals", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-11T12:00:00.000Z"));

    const caseId = "11111111-1111-1111-1111-111111111111";
    const principalId1 = "22222222-2222-2222-2222-222222222222";
    const principalId2 = "33333333-3333-3333-3333-333333333333";
    const vouchers: Voucher[] = [
      {
        id: principalId1,
        case_id: caseId,
        type_id: VoucherType.Principal,
        amount: 10000,
        annual_interest_rate: null,
        reference_voucher_id: null,
        date: "2025-01-01T00:00:00.000Z",
        created_at: "2026-09-11T12:00:00.000Z",
      },
      {
        id: principalId2,
        case_id: caseId,
        type_id: VoucherType.Principal,
        amount: 5000,
        annual_interest_rate: null,
        reference_voucher_id: null,
        date: "2025-01-02T00:00:00.000Z",
        created_at: "2026-09-11T12:00:00.000Z",
      },
      {
        id: "44444444-4444-4444-4444-444444444444",
        case_id: caseId,
        type_id: VoucherType.Interest,
        amount: 0,
        annual_interest_rate: 10,
        reference_voucher_id: principalId1,
        date: "2026-09-01T00:00:00.000Z",
        created_at: "2026-09-11T12:00:00.000Z",
      },
      {
        id: "55555555-5555-5555-5555-555555555555",
        case_id: caseId,
        type_id: VoucherType.Interest,
        amount: 0,
        annual_interest_rate: 10,
        reference_voucher_id: principalId2,
        date: "2026-09-01T00:00:00.000Z",
        created_at: "2026-09-11T12:00:00.000Z",
      },
      {
        id: "66666666-6666-6666-6666-666666666666",
        case_id: caseId,
        type_id: VoucherType.Payment,
        amount: -2000,
        annual_interest_rate: null,
        reference_voucher_id: null,
        date: "2026-09-08T12:00:00.000Z",
        created_at: "2026-09-11T12:00:00.000Z",
      },
    ];

    const status = calculateCaseStatus(caseId, vouchers);
    
    expect(status.by_principal[0].remaining_principal).toBe(8019.18);
    expect(status.by_principal[0].accrued_interest).toBe(6.59);
    expect(status.by_principal[1].remaining_principal).toBe(5000);
    expect(status.by_principal[1].accrued_interest).toBe(13.7);
    expect(status.principal).toBe(13019.18);
    expect(status.interest).toBe(20.29);
    expect(status.total).toBe(13039.47);
  });

});