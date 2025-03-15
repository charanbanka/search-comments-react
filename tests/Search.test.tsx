import React from "react"; // Add this at the top of your test file
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import Search from "../src/components/Search/Search.tsx";
import useDebounce from "../src/components/customHooks/useDebounce.ts"; // Adjust the import path

// Mock the useDebounce hook
vi.mock("../customHooks/useDebounce", () => ({
  default: (value: string) => value, // For simplicity, return value directly (no delay in tests)
}));

// Mock XMLHttpRequest globally
const mockComments = [
  { id: 1, name: "John", email: "john@example.com", body: "This is a comment" },
  {
    id: 2,
    name: "Jane",
    email: "jane@example.com",
    body: "Another comment here",
  },
];

describe("Search Component", () => {
  let xhrMock: {
    open: ReturnType<typeof vi.fn>;
    send: ReturnType<typeof vi.fn>;
    onreadystatechange: () => void;
    readyState: number;
    status: number;
    responseText: string;
  };

  beforeEach(() => {
    // Mock XMLHttpRequest
    xhrMock = {
      open: vi.fn(),
      send: vi.fn(),
      onreadystatechange: vi.fn(),
      readyState: 4,
      status: 200,
      responseText: JSON.stringify(mockComments),
    };
    global.XMLHttpRequest = vi.fn(() => xhrMock) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the search input and button", () => {
    render(<Search />);
    expect(
      screen.getByPlaceholderText("Search comments...")
    ).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  it("displays error message for input less than 4 characters", async () => {
    render(<Search />);
    const input = screen.getByPlaceholderText("Search comments...");
    fireEvent.change(input, { target: { value: "ac" } });
    await waitFor(
      () => {
        expect(
          screen.queryByText("Please Enter Atleast 4 characters!")
        ).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("clears error and results when input is empty", async () => {
    render(<Search />);
    const input = screen.getByPlaceholderText("Search comments...");
    fireEvent.change(input, { target: { value: "test" } });
    await waitFor(
      () => {
        expect(
          screen.queryByText("Please Enter Atleast 4 characters!")
        ).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
    fireEvent.change(input, { target: { value: "" } });
    await waitFor(() => {
      expect(
        screen.queryByText("Please Enter Atleast 4 characters!")
      ).not.toBeInTheDocument();
      expect(screen.getByText("No Comments...")).toBeInTheDocument();
    });
  });

  it("fetches results when debounced value updates", async () => {
    render(<Search />);

    const input = screen.getByPlaceholderText("Search comments...");

    // Simulate user typing
    fireEvent.change(input, { target: { value: "testing" } });

    // Wait for the effect to run (debounce is mocked as immediate)
    await waitFor(
      () => {
        expect(xhrMock.open).toHaveBeenCalledWith(
          "GET",
          "https://jsonplaceholder.typicode.com/comments?q=testing",
          true
        );
        expect(xhrMock.send).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );

    // Simulate XHR response
    xhrMock.onreadystatechange();
    await waitFor(() => {
      expect(screen.getByText("John")).toBeInTheDocument();
    });
  });

  it("calls fetchResults and shows loading state on valid input", async () => {
    render(<Search />);
    const input = screen.getByPlaceholderText("Search comments...");
    fireEvent.change(input, { target: { value: "testing" } });

    await waitFor(() => {
      expect(screen.getByText("Loading Comments...")).toBeInTheDocument();
    });

    // Simulate XHR response
    xhrMock.onreadystatechange();
    await waitFor(() => {
      expect(screen.queryByText("Loading Comments...")).not.toBeInTheDocument();
      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.getByText("Jane")).toBeInTheDocument();
    });
  });

  it("limits results to 20 and truncates long body text", async () => {
    const longBodyComment = {
      id: 3,
      name: "Bob",
      email: "bob@example.com",
      body: "This is a very long comment that exceeds 64 characters and should be truncated in the UI accordingly.",
    };
    xhrMock.responseText = JSON.stringify([...mockComments, longBodyComment]);
    render(<Search />);
    const input = screen.getByPlaceholderText("Search comments...");
    fireEvent.change(input, { target: { value: "testing" } });

    xhrMock.onreadystatechange();
    await waitFor(() => {
      const bodyText = screen.getByText(
        /This is a very long comment that exceeds 64 characters and shoul.../
      );
      expect(bodyText).toBeInTheDocument();
    });
  });

  it("triggers fetchResults on button click", async () => {
    render(<Search />);
    const input = screen.getByPlaceholderText("Search comments...");
    const button = screen.getByText("Search");
    fireEvent.change(input, { target: { value: "testing" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(xhrMock.open).toHaveBeenCalledWith(
        "GET",
        "https://jsonplaceholder.typicode.com/comments?q=testing",
        true
      );
      expect(xhrMock.send).toHaveBeenCalled();
    });

    xhrMock.onreadystatechange();
    await waitFor(() => {
      expect(screen.getByText("John")).toBeInTheDocument();
    });
  });

  it("handles XHR error gracefully", async () => {
    xhrMock.status = 500; // Simulate server error
    render(<Search />);
    const input = screen.getByPlaceholderText("Search comments...");
    fireEvent.change(input, { target: { value: "testing" } });

    xhrMock.onreadystatechange();
    await waitFor(() => {
      expect(screen.queryByText("John")).not.toBeInTheDocument();
      expect(screen.getByText("No Comments...")).toBeInTheDocument(); // Fallback UI
    });
  });
});
