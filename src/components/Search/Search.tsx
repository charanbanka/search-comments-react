import React, { useState, useEffect, useCallback } from "react";
import useDebounce from "../customHooks/useDebounce";
import Pagination from "../pagination";

const API_URL = "https://jsonplaceholder.typicode.com/comments";

interface Comment {
  id: number;
  name: string;
  email: string;
  body: string;
}

const Search: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Comment[]>([]);
  const [currentPageItems, setCurrentPageItems] = useState<Comment[]>([]);
  const [paginationData, setPaginationData] = useState({
    currentPage: 1,
    itemsPerPage: 20,
    totalCount: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const debouncedQuery = useDebounce(query, 1000);

  const fetchResults = useCallback(async (searchText: string) => {
    if (searchText.length <= 3 && searchText.length !== 0) {
      setError("Please enter at least 4 characters!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}?q=${encodeURIComponent(searchText)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Comment[] = await response.json();
      setResults(data);
      setPaginationData((prev) => {
        return { ...prev, currentPage: 1, totalCount: data.length || 0 };
      });
      setCurrentPageItems(data.slice(0, paginationData.itemsPerPage));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(debouncedQuery);
  }, [debouncedQuery, fetchResults]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults(query);
  };

  const handleNextPage = (newPage: number) => {
    setPaginationData((prev) => {
      return { ...prev, currentPage: newPage };
    });
    setCurrentPageItems(
      results.slice(
        paginationData.itemsPerPage * (newPage - 1),
        paginationData.itemsPerPage * newPage
      )
    );
  };

  return (
    <div className="search-container" data-testid="search-container">
      <form
        onSubmit={handleSubmit}
        className="search-main"
        data-testid="search-main"
      >
        <div className="search-field">
          <input
            type="text"
            placeholder="Search comments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            aria-label="Search comments"
          />
          {error && (
            <span className="text-danger" role="alert">
              {error}
            </span>
          )}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      {loading && <p aria-live="polite">Loading Comments...</p>}
      <div className="table-container" data-testid="table-container">
        <table role="grid">
          <thead>
            <tr>
              <th scope="col">Sr.No</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Body</th>
            </tr>
          </thead>
          <tbody>
            {currentPageItems.length > 0 ? (
              currentPageItems.map((item, idx) => (
                <tr key={item.id}>
                  <td>
                    {idx +
                      1 +
                      (paginationData.currentPage - 1) *
                        paginationData.itemsPerPage}
                  </td>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td title={item.body}>
                    {item.body.length > 64
                      ? `${item.body.substring(0, 64)}...`
                      : item.body}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>No Comments...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {results.length > paginationData.itemsPerPage && (
        <div>
          <Pagination
            totalCount={results.length || 0}
            currentPage={paginationData.currentPage}
            itemsPerPage={20}
            onNextPage={handleNextPage}
          />
        </div>
      )}
    </div>
  );
};

export default Search;
