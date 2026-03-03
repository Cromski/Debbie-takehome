import styled, { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #1a1a1a;
    background: #f5f5f5;
    line-height: 1.5;
  }
`;

export const Container = styled.div`
  max-width: 860px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
`;

export const Card = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    text-align: left;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid #eee;
  }

  th {
    font-weight: 600;
    font-size: 0.85rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  tbody tr:hover {
    background: #fafafa;
  }
`;

export const Button = styled.button<{ $variant?: "secondary" }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  background: ${(p) => (p.$variant === "secondary" ? "#e8e8e8" : "#2563eb")};
  color: ${(p) => (p.$variant === "secondary" ? "#1a1a1a" : "#fff")};

  &:hover {
    opacity: 0.9;
  }
`;

export const Input = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

export const Select = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #fff;

  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;

export const Form = styled.form`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
`;

export const Title = styled.h1`
  font-size: 1.5rem;
  margin: 0 0 1.5rem;
`;

export const Subtitle = styled.h2`
  font-size: 1.2rem;
  margin: 0 0 1rem;
`;

export const Label = styled.h3`
  font-size: 1rem;
  margin: 1.5rem 0 0.75rem;
  color: #444;
`;
