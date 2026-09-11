import { z } from "zod";

export enum VoucherType {
  Principal = "principal",
  Interest = "interest",
  Payment = "payment",
}

const dateStringSchema = z.string().refine(
  (value) => !Number.isNaN(Date.parse(value)),
  { message: "Invalid date" },
);

const uuidSchema = z.uuid();

export const createVoucherInputSchema = z.object({
  type_id: z.enum(VoucherType),
  amount: z.number().finite(),
  annual_interest_rate: z.number().finite().nullable().optional(),
  reference_voucher_id: uuidSchema.nullable().optional(),
  date: dateStringSchema,
}).superRefine((value, ctx) => {
  const isInterest = value.type_id === VoucherType.Interest;

  // Validate that interest vouchers have the required fields
  if (isInterest && value.annual_interest_rate == null) {
    ctx.addIssue({
      code: "custom",
      path: ["annual_interest_rate"],
      message: "annual_interest_rate is required for interest vouchers",
    });
  }

  if (isInterest && value.reference_voucher_id == null) {
    ctx.addIssue({
      code: "custom",
      path: ["reference_voucher_id"],
      message: "reference_voucher_id is required for interest vouchers",
    });
  }

  if (!isInterest && value.annual_interest_rate != null) {
    ctx.addIssue({
      code: "custom",
      path: ["annual_interest_rate"],
      message: "annual_interest_rate is only allowed on interest vouchers",
    });
  }

  if (!isInterest && value.reference_voucher_id != null) {
    ctx.addIssue({
      code: "custom",
      path: ["reference_voucher_id"],
      message: "reference_voucher_id is only allowed on interest vouchers",
    });
  }

  if (value.type_id === VoucherType.Principal && value.amount <= 0) {
    ctx.addIssue({
      code: "custom",
      path: ["amount"],
      message: "principal amount must be greater than 0",
    });
  }

  if (value.type_id === VoucherType.Payment && value.amount >= 0) {
    ctx.addIssue({
      code: "custom",
      path: ["amount"],
      message: "payment amount must be less than 0",
    });
  }

  if (value.type_id === VoucherType.Interest && value.amount !== 0) {
    ctx.addIssue({
      code: "custom",
      path: ["amount"],
      message: "interest amount must be 0",
    });
  }

  if (
    value.type_id === VoucherType.Interest &&
    value.annual_interest_rate != null &&
    (value.annual_interest_rate <= 0 || value.annual_interest_rate > 100)
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["annual_interest_rate"],
      message: "annual_interest_rate must be greater than 0 and at most 100",
    });
  }
});

export interface Voucher {
  id: string;
  case_id: string;
  type_id: VoucherType;
  amount: number;
  annual_interest_rate: number | null;
  reference_voucher_id: string | null;
  date: string;
  created_at: string;
}

export interface CreateVoucherInput {
  type_id: VoucherType;
  amount: number;
  annual_interest_rate?: number | null;
  reference_voucher_id?: string | null;
  date: string;
}
