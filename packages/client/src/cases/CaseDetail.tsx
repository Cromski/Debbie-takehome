import { useEffect, useState } from "react";
import type { Case, CaseStatus, Voucher } from "@takehome/common";
import { api } from "../api";
import { VoucherList } from "../vouchers/VoucherList";
import { Card, Button, Subtitle, Label, Table } from "../styles";
import { formatIsoDate } from "../util/date";

export function CaseDetail({
  caseId,
  onBack,
}: {
  caseId: string;
  onBack: () => void;
}) {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [status, setStatus] = useState<CaseStatus | null>(null);

  const formatMoney = (amount: number) =>
    amount.toLocaleString("da-DK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  function load() {
    api.get<Case>(`/cases/${caseId}`).then(setCaseData).catch(console.error);
    api
      .get<Voucher[]>(`/cases/${caseId}/vouchers`)
      .then((data) => {
        setVouchers(data);
        console.log("Vouchers loaded:", data);
      })
      .catch(console.error);
    api.get<CaseStatus>(`/cases/${caseId}/status`).then(setStatus).catch(console.error);
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
          Created: {formatIsoDate(caseData.created_at)}
        </p>
      </Card>

      {status && (
        <Card>
          <Label style={{ marginTop: 0 }}>Principal Status</Label>
          <p style={{ margin: "0 0 1rem", color: "#555" }}>
            Total principal: {formatMoney(status.principal)} | Total interest: {formatMoney(status.interest)} |
            Total due: {formatMoney(status.total)}
          </p>

          {status.by_principal.length === 0 ? (
            <p style={{ color: "#666", margin: 0 }}>No principal vouchers yet.</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Principal Date</th>
                  <th>Rate</th>
                  <th>Original</th>
                  <th>Paid Principal</th>
                  <th>Remaining Principal</th>
                  <th>Accrued Interest</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {status.by_principal.map((item) => (
                  <tr key={item.principal_voucher_id}>
                    <td>{formatIsoDate(item.principal_voucher_date)}</td>
                    <td>{item.annual_interest_rate != null ? `${item.annual_interest_rate}%` : "-"}</td>
                    <td>{formatMoney(item.original_principal)}</td>
                    <td>{formatMoney(item.principal_paid)}</td>
                    <td>{formatMoney(item.remaining_principal)}</td>
                    <td>{formatMoney(item.accrued_interest)}</td>
                    <td>{formatMoney(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}

      <VoucherList caseId={caseId} vouchers={vouchers} onCreated={load} />
    </>
  );
}
