import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import Search from "../src/components/Search/Search.tsx";

// Mock the useDebounce hook
vi.mock("../src/customHooks/useDebounce.ts", () => ({
  default: (value: string) => value, // Immediate return for testing
}));

vi.mock("../src/components/pagination", () => ({
  default: ({ totalCount, currentPage, itemsPerPage, onNextPage }) => (
    <div data-testid="pagination">
      <button onClick={() => onNextPage(currentPage - 1)}>Prev</button>
      <span>Page {currentPage}</span>
      <button onClick={() => onNextPage(currentPage + 1)}>Next</button>
    </div>
  ),
}));

const mockComments = [
  { id: 1, name: "John", email: "john@example.com", body: "This is a comment" },
  {
    id: 2,
    name: "Jane",
    email: "jane@example.com",
    body: "Another comment here",
  },
  ...Array.from({ length: 23 }, (_, i) => ({
    id: i + 3,
    name: `User${i + 3}`,
    email: `user${i + 3}@example.com`,
    body: `Comment ${i + 3}`,
  })),
];

describe("Search Component", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockComments),
      } as Response)
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with correct initial classNames and structure", () => {
    render(<Search />);

    const container = screen.getByTestId("search-container");
    expect(container).toHaveClass("search-container");

    const form = screen.getByTestId("search-main");
    expect(form).toHaveClass("search-main");

    const input = screen.getByPlaceholderText("Search comments...");
    expect(input.parentElement).toHaveClass("search-field");

    const table = screen.getByRole("grid");
    expect(table.parentElement).toHaveClass("table-container");

    expect(screen.getByText("No Comments...")).toBeInTheDocument();
  });

  it("displays error message with text-danger class for short input", async () => {
    render(<Search />);
    const input = screen.getByPlaceholderText("Search comments...");
    fireEvent.change(input, { target: { value: "abc" } });

    await waitFor(
      () => {
        const error = screen.queryByText("Please enter at least 4 characters!");
        expect(error).toBeInTheDocument();
        expect(error).toHaveClass("text-danger");
        expect(error).toHaveAttribute("role", "alert");
      },
      { timeout: 2000 }
    );
  });

  it("clears error and shows no comments when input is empty", async () => {
    render(<Search />);
    const input = screen.getByPlaceholderText("Search comments...");

    fireEvent.change(input, { target: { value: "test" } });

    await waitFor(
      () => {
        expect(
          screen.queryByText("Please enter at least 4 characters!")
        ).not.toBeInTheDocument();
        expect(screen.getByText("No Comments...")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("fetches results and renders table rows on valid input", async () => {
    render(<Search />);
    const input = screen.getByPlaceholderText("Search comments...");

    fireEvent.change(input, { target: { value: "testing" } });

    await waitFor(
      () => {
        expect(global.fetch).toHaveBeenCalledWith(
          "https://jsonplaceholder.typicode.com/comments?q=testing"
        );
        const tableRows = screen.getAllByRole("row");
        expect(screen.getByText("John")).toBeInTheDocument();
        expect(screen.getByText("jane@example.com")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("calls fetchResults with query on form submission", async () => {
    render(<Search />);
    const input = screen.getByPlaceholderText("Search comments...");
    const form = screen.getByTestId("search-main"); // Assuming data-testid is added

    // Set input value
    fireEvent.change(input, { target: { value: "submit-test" } });

    // Submit the form
    fireEvent.submit(form);

    await waitFor(
      () => {
        expect(global.fetch).toHaveBeenCalledWith(
          "https://jsonplaceholder.typicode.com/comments?q=submit-test"
        );
        expect(screen.getByText("John")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("handles non-Error fetch rejection with generic error message", async () => {
    // Mock fetch to reject with a non-Error value (e.g., a string)
    global.fetch = vi.fn(() => Promise.reject("Network failure"));

    render(<Search />);
    const input = screen.getByPlaceholderText("Search comments...");

    fireEvent.change(input, { target: { value: "testing" } });

    await waitFor(
      () => {
        const error = screen.getByText(
          "An error occurred while fetching data."
        );
        expect(error).toBeInTheDocument();
        expect(error).toHaveClass("text-danger");
      },
      { timeout: 2000 }
    );
  });

  it("handles Error object fetch rejection with specific message", async () => {
    // Mock fetch to reject with an Error object
    global.fetch = vi.fn(() => Promise.reject(new Error("Network error")));

    render(<Search />);
    const input = screen.getByPlaceholderText("Search comments...");

    fireEvent.change(input, { target: { value: "testing" } });

    await waitFor(
      () => {
        const error = screen.getByText("Network error");
        expect(error).toBeInTheDocument();
        expect(error).toHaveClass("text-danger");
      },
      { timeout: 2000 }
    );
  });

  it("shows loading state with correct attributes", async () => {
    let resolveFetch: (value: Response) => void;
    global.fetch = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    render(<Search />);
    const input = screen.getByPlaceholderText("Search comments...");
    fireEvent.change(input, { target: { value: "testing" } });

    await waitFor(() => {
      const loading = screen.getByText("Loading Comments...");
      expect(loading).toBeInTheDocument();
      expect(loading).toHaveAttribute("aria-live", "polite");
    });

    resolveFetch!({
      ok: true,
      json: () => Promise.resolve(mockComments),
    } as Response);

    await waitFor(() => {
      expect(screen.queryByText("Loading Comments...")).not.toBeInTheDocument();
    });
  });

  it("truncates long body text and adds title attribute", async () => {
    const longComment = {
      id: 3,
      name: "Bob",
      email: "bob@example.com",
      body: "This is a very long comment that exceeds 64 characters and should be truncated in the UI.",
    };
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([longComment]),
      } as Response)
    );

    render(<Search />);
    const input = screen.getByPlaceholderText("Search comments...");
    fireEvent.change(input, { target: { value: "testing" } });

    await waitFor(() => {
      const truncatedText = screen.getByText(
        "This is a very long comment that exceeds 64 characters and shoul..."
      );
      expect(truncatedText).toBeInTheDocument();
      expect(truncatedText).toHaveAttribute("title", longComment.body);
    });
  });

  it("disables input and button during loading", async () => {
    let resolveFetch: (value: Response) => void;
    global.fetch = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    render(<Search />);
    const input = screen.getByPlaceholderText("Search comments...");
    const button = screen.getByRole("button", { name: "Searching..." });

    fireEvent.change(input, { target: { value: "testing" } });

    await waitFor(() => {
      expect(input).toBeDisabled();
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent("Searching...");
    });

    resolveFetch!({
      ok: true,
      json: () => Promise.resolve(mockComments),
    } as Response);

    await waitFor(() => {
      expect(input).not.toBeDisabled();
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent("Search");
    });
  });

  it("triggers fetch on form submission", async () => {
    render(<Search />);
    const input = screen.getByPlaceholderText("Search comments...");
    const button = screen.getByRole("button", { name: /Search/ });

    fireEvent.change(input, { target: { value: "testing" } });
    fireEvent.click(button);

    await waitFor(
      () => {
        expect(global.fetch).toHaveBeenCalledWith(
          "https://jsonplaceholder.typicode.com/comments?q=testing"
        );
        expect(screen.getByText("John")).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("handles fetch error with proper styling", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      } as Response)
    );

    render(<Search />);
    const input = screen.getByPlaceholderText("Search comments...");
    fireEvent.change(input, { target: { value: "testing" } });

    await waitFor(() => {
      const error = screen.getByText("HTTP error! status: 500");
      expect(error).toBeInTheDocument();
      expect(error).toHaveClass("text-danger");
      expect(error).toHaveAttribute("role", "alert");
    });
  });
});

describe("Pagination Functionality", () => {
  it("does not render Pagination when results are fewer than itemsPerPage", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockComments.slice(0, 10)), // 10 < 20
      } as Response)
    );

    render(<Search />);
    fireEvent.change(screen.getByPlaceholderText("Search comments..."), {
      target: { value: "testing" },
    });

    await waitFor(() => {
      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
    });
  });

  it("displays correct initial page items (first 20) when results exceed itemsPerPage", async () => {
    render(<Search />);
    fireEvent.change(screen.getByPlaceholderText("Search comments..."), {
      target: { value: "" },
    });

    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      expect(rows.length).toBe(11); // 1 header + 20 items
      expect(screen.getByText("John")).toBeInTheDocument(); // Page 1, item 1
      expect(screen.getByText("User10")).toBeInTheDocument(); // Page 1, item 20
      expect(screen.queryByText("User11")).not.toBeInTheDocument(); // Page 2
    });
  });

  it("updates currentPage and page items when handleNextPage is triggered via Prev", async () => {
    // Start on page 2
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockComments),
      } as Response)
    );

    render(<Search />);
    fireEvent.change(screen.getByPlaceholderText("Search comments..."), {
      target: { value: "testing" },
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText("Next")); // Go to page 2
    });

    await waitFor(() => {
      expect(screen.getByText("Page 2")).toBeInTheDocument();
      expect(screen.getByText("User21")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Prev"));

    await waitFor(() => {
      expect(screen.getByText("Page 1")).toBeInTheDocument();
      expect(screen.getByText("John")).toBeInTheDocument(); // Back to page 1
      expect(screen.queryByText("User21")).not.toBeInTheDocument(); // Not on page 1
      const rows = screen.getAllByRole("row");
      expect(rows.length).toBe(21); // 1 header + 20 items
    });
  });

  it("handlesNextPage correctly updates serial numbers in table", async () => {
    render(<Search />);
    fireEvent.change(screen.getByPlaceholderText("Search comments..."), {
      target: { value: "testing" },
    });

    await waitFor(() => {
      const firstRowSrNo = screen.getAllByRole("cell")[0];
      expect(firstRowSrNo).toHaveTextContent("1"); // Page 1, first item
      const lastRowSrNo = screen.getAllByRole("cell")[19 * 4]; // 20th row, 1st column
      expect(lastRowSrNo).toHaveTextContent("20");
    });

    fireEvent.click(screen.getByText("Next"));

    await waitFor(() => {
      const firstRowSrNo = screen.getAllByRole("cell")[0];
      expect(firstRowSrNo).toHaveTextContent("21"); // Page 2, first item
      const lastRowSrNo = screen.getAllByRole("cell")[4 * 4]; // 5th row, 1st column
      expect(lastRowSrNo).toHaveTextContent("25");
    });
  });

  it("does not render Pagination when results exactly match itemsPerPage", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockComments.slice(0, 20)), // Exactly 20
      } as Response)
    );

    render(<Search />);
    fireEvent.change(screen.getByPlaceholderText("Search comments..."), {
      target: { value: "testing" },
    });

    await waitFor(() => {
      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.queryByTestId("pagination")).not.toBeInTheDocument();
      const rows = screen.getAllByRole("row");
      expect(rows.length).toBe(21); // 1 header + 20 items
    });
  });
});
