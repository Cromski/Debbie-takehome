export enum VoucherType {
  Principal = "principal",
  Interest = "interest",
  Payment = "payment",
}

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
