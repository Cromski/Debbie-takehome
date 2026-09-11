import { useState } from "react";
import type { Case, CreateCaseInput } from "@takehome/common";
import { ApiRequestError, api } from "../api";
import { Card, Table, Form, Input, Button, Subtitle, Label } from "../styles";
import { formatIsoDate } from "../util/date";

export function CaseList({
  cases,
  onSelect,
  onCreated,
}: {
  cases: Case[];
  onSelect: (id: string) => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<CreateCaseInput>({
    reference: "",
    debtor_name: "",
    created_at: new Date().toISOString().split("T")[0],
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorIssues, setErrorIssues] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setErrorIssues([]);

    try {
      await api.post("/cases", form);
      setForm({
        reference: "",
        debtor_name: "",
        created_at: new Date().toISOString().split("T")[0],
      });
      onCreated();
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setErrorMessage(error.body?.message ?? "Could not create case.");
        setErrorIssues(error.body?.issues?.map((issue) => issue.message) ?? []);
        return;
      }

      setErrorMessage("Could not create case.");
    }
  }

  return (
    <>
      <Card>
        <Subtitle>Cases</Subtitle>
        <Table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Debtor</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr
                key={c.id}
                onClick={() => onSelect(c.id)}
                style={{ cursor: "pointer" }}
              >
                <td>{c.reference}</td>
                <td>{c.debtor_name}</td>
                <td>{formatIsoDate(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card>
        <Label>Create case</Label>
        {errorMessage && (
          <p style={{ color: "#b42318", marginTop: 0 }}>
            {errorMessage}
            {errorIssues.length > 0 && `: ${errorIssues.join("; ")}`}
          </p>
        )}
        <Form onSubmit={handleSubmit}>
          <Input
            placeholder="Reference"
            value={form.reference}
            onChange={(e) => setForm({ ...form, reference: e.target.value })}
            required
          />
          <Input
            placeholder="Debtor name"
            value={form.debtor_name}
            onChange={(e) => setForm({ ...form, debtor_name: e.target.value })}
            required
          />
          <Input
            type="date"
            value={form.created_at}
            onChange={(e) => setForm({ ...form, created_at: e.target.value })}
            required
          />
          <Button type="submit">Create</Button>
        </Form>
      </Card>
    </>
  );
}
