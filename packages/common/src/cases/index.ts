
import { z } from "zod";

export interface Case {
  id: string;
  reference: string;
  debtor_name: string;
  created_at: string;
}

const dateStringSchema = z.string().refine(
  (value) => !Number.isNaN(Date.parse(value)),
  { message: "Invalid date" },
);

export const createCaseInputSchema = z.object({
  reference: z.string().trim().min(1).max(100),
  debtor_name: z.string().trim().min(1).max(200),
  created_at: dateStringSchema,
});

export interface CreateCaseInput {
  reference: string;
  debtor_name: string;
  created_at: string;
}

export interface PrincipalVoucherStatus {
  principal_voucher_id: string;
  principal_voucher_date: string;
  annual_interest_rate: number | null;
  original_principal: number;
  principal_paid: number;
  remaining_principal: number;
  accrued_interest: number;
  total: number;
}

export interface CaseStatus {
  case_id: string;
  principal: number;
  interest: number;
  total: number;
  by_principal: PrincipalVoucherStatus[];
}