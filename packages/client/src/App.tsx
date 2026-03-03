import { useEffect, useState } from "react";
import type { Case } from "@takehome/common";
import { api } from "./api";
import { CaseList } from "./cases/CaseList";
import { CaseDetail } from "./cases/CaseDetail";
import { GlobalStyle, Container, Title } from "./styles";

export function App() {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  function loadCases() {
    api.get<Case[]>("/cases").then(setCases).catch(console.error);
  }

  useEffect(loadCases, []);

  return (
    <>
      <GlobalStyle />
      <Container>
        <Title>Debbie Takehome</Title>
        {selectedCaseId ? (
          <CaseDetail
            caseId={selectedCaseId}
            onBack={() => setSelectedCaseId(null)}
          />
        ) : (
          <CaseList
            cases={cases}
            onSelect={setSelectedCaseId}
            onCreated={loadCases}
          />
        )}
      </Container>
    </>
  );
}
