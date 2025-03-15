import App from "./App"; // Adjust the import path
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";

// Mock the Search component
vi.mock("./components/Search/Search", () => ({
  default: () => <div data-testid="mock-search">Mock Search Component</div>,
}));

describe("App Component", () => {
  it("renders the heading and Search component", () => {
    render(<App />);

    // Check for the heading
    const heading = screen.getByText("Search Comments");
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H1");

    // Check for the mocked Search component
    const searchComponent = screen.getByTestId("mock-search");
    expect(searchComponent).toBeInTheDocument();
    expect(searchComponent).toHaveTextContent("Mock Search Component");
  });

  it("applies the App className to the root div", () => {
    const { container } = render(<App />);
    const appDiv = container.querySelector(".App");
    expect(appDiv).toBeInTheDocument();
    expect(appDiv).toHaveClass("App");
  });
});
