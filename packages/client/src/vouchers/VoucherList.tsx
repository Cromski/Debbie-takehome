import { useState } from "react";
import { VoucherType, type Voucher, type CreateVoucherInput } from "@takehome/common";
import { api } from "../api";
import { Card, Table, Form, Input, Select, Button, Label } from "../styles";

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
    date: new Date().toISOString().split("T")[0],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api.post(`/cases/${caseId}/vouchers`, form);
    setForm({
      type_id: VoucherType.Payment,
      amount: 0,
      annual_interest_rate: null,
      date: new Date().toISOString().split("T")[0],
    });
    onCreated();
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
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.id}>
                  <td>{v.date}</td>
                  <td>{v.type_id}</td>
                  <td>{v.amount}</td>
                  <td>
                    {v.annual_interest_rate != null
                      ? `${v.annual_interest_rate}%`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Card>
        <Label style={{ marginTop: 0 }}>Add voucher</Label>
        <Form onSubmit={handleSubmit}>
          <Select
            value={form.type_id}
            onChange={(e) =>
              setForm({
                ...form,
                type_id: e.target.value as VoucherType,
                annual_interest_rate:
                  e.target.value === VoucherType.Interest
                    ? form.annual_interest_rate
                    : null,
              })
            }
          >
            <option value={VoucherType.Principal}>Principal</option>
            <option value={VoucherType.Interest}>Interest</option>
            <option value={VoucherType.Payment}>Payment</option>
          </Select>
          <Input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={form.amount || ""}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            required
          />
          {form.type_id === VoucherType.Interest && (
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
          )}
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
