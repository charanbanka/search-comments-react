import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import useDebounce from "./useDebounce"; // Adjust path if necessary

describe("useDebounce Hook", () => {
  beforeEach(() => {
    vi.useFakeTimers(); // Mock timers
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));
    expect(result.current).toBe("initial");
  });

  it("updates value after debounce delay", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: "hello" },
    });

    expect(result.current).toBe("hello");

    rerender({ value: "world" });

    // Before debounce time
    expect(result.current).toBe("hello");

    // Advance time by 500ms
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("world");
  });

  it("resets debounce timer when value changes", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: "first" },
    });

    expect(result.current).toBe("first");

    // Change value before debounce completes
    rerender({ value: "second" });
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current).toBe("first"); // Still old value

    rerender({ value: "third" });
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current).toBe("first"); // Timer reset

    // Finally allow debounce to complete
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("third");
  });
});
