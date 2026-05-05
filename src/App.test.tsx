import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import { ThemeRoot } from "@/components/layout/ThemeRoot";

vi.mock("@/components/kanban/KanbanBoard", () => ({
  KanbanBoard: () => <div data-testid="kanban-stub" />,
}));

describe("App", () => {
  it("renders home heading", () => {
    render(
      <ThemeRoot>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </ThemeRoot>,
    );
    expect(
      screen.getByRole("heading", { name: /обзор доски/i }),
    ).toBeInTheDocument();
  });
});
