
export interface Case {
  id: string;
  reference: string;
  debtor_name: string;
  created_at: string;
}

export interface CreateCaseInput {
  reference: string;
  debtor_name: string;
  created_at: string;
}
