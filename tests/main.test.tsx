import { vi, describe, it, expect, afterEach, beforeAll } from "vitest";
import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "../src/App"; // Adjust the path as needed

// Mock createRoot from react-dom/client
vi.mock("react-dom/client", () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
  })),
}));

describe("main.tsx", () => {
  let originalGetElementById: typeof document.getElementById;

  beforeAll(() => {
    originalGetElementById = document.getElementById; // Backup original function
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.getElementById = originalGetElementById; // Restore original function after each test
  });

  it("renders the App component inside StrictMode when root element exists", async () => {
    const mockRootElement = document.createElement("div");
    document.getElementById = vi.fn(() => mockRootElement);

    await import("../src/main.tsx"); // Execute the module

    // Ensure createRoot was called with the mock element
    expect(createRoot).toHaveBeenCalledWith(mockRootElement);

    // Extract the mocked render function
    const mockRootInstance = (createRoot as ReturnType<typeof vi.fn>).mock
      .results[0].value;
    expect(mockRootInstance.render).toHaveBeenCalledWith(
      <StrictMode>
        <App />
      </StrictMode>
    );
  });
});
