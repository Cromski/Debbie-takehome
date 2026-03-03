import { useEffect, useState } from "react";
import type { Case, Voucher } from "@takehome/common";
import { api } from "../api";
import { VoucherList } from "../vouchers/VoucherList";
import { Card, Button, Subtitle } from "../styles";

export function CaseDetail({
  caseId,
  onBack,
}: {
  caseId: string;
  onBack: () => void;
}) {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  function load() {
    api.get<Case>(`/cases/${caseId}`).then(setCaseData).catch(console.error);
    api
      .get<Voucher[]>(`/cases/${caseId}/vouchers`)
      .then(setVouchers)
      .catch(console.error);
  }

  useEffect(load, [caseId]);

  if (!caseData) return <p>Loading...</p>;

  return (
    <>
      <Button $variant="secondary" onClick={onBack}>
        &larr; Back
      </Button>
      <Card style={{ marginTop: "1rem" }}>
        <Subtitle>
          {caseData.reference} &mdash; {caseData.debtor_name}
        </Subtitle>
        <p style={{ color: "#666", margin: 0 }}>
          Created: {caseData.created_at}
        </p>
      </Card>
      <VoucherList caseId={caseId} vouchers={vouchers} onCreated={load} />
    </>
  );
}
