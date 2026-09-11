import { useState } from "react";
import { VoucherType, type Voucher, type CreateVoucherInput } from "@takehome/common";
import { ApiRequestError, api } from "../api";
import { Card, Table, Form, Input, Select, Button, Label } from "../styles";
import { formatIsoDate } from "../util/date";

export function VoucherList({
  caseId,
  vouchers,
  onCreated,
}: {
  caseId: string;
  vouchers: Voucher[];
  onCreated: () => void;
}) {
  const [form, setForm] = useState<CreateVoucherInput>({
    type_id: VoucherType.Payment,
    amount: 0,
    annual_interest_rate: null,
    reference_voucher_id: null,
    date: new Date().toISOString().split("T")[0],
  });
  const [deletingVoucherId, setDeletingVoucherId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorIssues, setErrorIssues] = useState<string[]>([]);
  const principalVouchers = vouchers.filter((voucher) => voucher.type_id === VoucherType.Principal);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setErrorIssues([]);

    try {
      await api.post(`/cases/${caseId}/vouchers`, form);
      setForm({
        type_id: VoucherType.Payment,
        amount: 0,
        annual_interest_rate: null,
        reference_voucher_id: null,
        date: new Date().toISOString().split("T")[0],
      });
      onCreated();
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setErrorMessage(error.body?.message ?? "Could not create voucher.");
        setErrorIssues(error.body?.issues?.map((issue) => issue.message) ?? []);
        return;
      }

      setErrorMessage("Could not create voucher.");
    }
  }

  async function handleDelete(voucherId: string) {
    setDeletingVoucherId(voucherId);
    try {
      await api.delete(`/cases/${caseId}/vouchers/${voucherId}`);
      onCreated();
    } finally {
      setDeletingVoucherId(null);
    }
  }

  return (
    <>
      <Card>
        <Label style={{ marginTop: 0 }}>Vouchers</Label>
        {vouchers.length === 0 ? (
          <p style={{ color: "#666" }}>No vouchers.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Interest rate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.id}>
                  <td>{formatIsoDate(v.date)}</td>
                  <td>{v.type_id}</td>
                  <td>{v.amount}</td>
                  <td>
                    {v.annual_interest_rate != null
                      ? `${v.annual_interest_rate}%`
                      : "—"}
                  </td>
                  <td>
                    <Button
                      style={{ color: "#b42318" }}
                      type="button"
                      $variant="secondary"
                      onClick={() => handleDelete(v.id)}
                      disabled={deletingVoucherId === v.id}
                    >
                      {deletingVoucherId === v.id ? "Deleting..." : "Delete"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Card>
        <Label style={{ marginTop: 0 }}>Add voucher</Label>
        {errorMessage && (
          <p style={{ color: "#b42318", marginTop: 0 }}>
            {errorMessage}
            {errorIssues.length > 0 && `: ${errorIssues.join("; ")}`}
          </p>
        )}
        <Form onSubmit={handleSubmit}>
          <Select
            value={form.type_id}
            onChange={(e) =>
              setForm({
                ...form,
                type_id: e.target.value as VoucherType,
                amount: e.target.value === VoucherType.Interest ? 0 : form.amount,
                annual_interest_rate:
                  e.target.value === VoucherType.Interest
                    ? form.annual_interest_rate
                    : null,
                reference_voucher_id:
                  e.target.value === VoucherType.Interest
                    ? form.reference_voucher_id
                    : null,
              })
            }
          >
            <option value={VoucherType.Principal}>Principal</option>
            <option value={VoucherType.Interest}>Interest</option>
            <option value={VoucherType.Payment}>Payment</option>
          </Select>
          
          {form.type_id === VoucherType.Interest ? (
            <>
              <Select
                value={form.reference_voucher_id ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    reference_voucher_id: e.target.value
                      ? e.target.value
                      : null,
                  })
                }
                required
              >
                <option value="" disabled>Select principal voucher</option>
                {principalVouchers.map((voucher) => (
                  <option key={voucher.id} value={voucher.id}>
                    {formatIsoDate(voucher.date)} - {voucher.amount}
                  </option>
                ))}
              </Select>
              <Input
                type="number"
                step="0.01"
                placeholder="Interest rate %"
                value={form.annual_interest_rate ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    annual_interest_rate: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
              />
            </>
          ) : 
          <Input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={form.amount || ""}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            required
          />
          }
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
          <Button type="submit">Add</Button>
        </Form>
      </Card>
    </>
  );
}
