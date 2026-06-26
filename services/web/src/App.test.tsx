import { render, screen } from "@testing-library/react";
import { App } from "./App";

test("renders the app heading", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: /wealth steward/i }),
  ).toBeInTheDocument();
});
