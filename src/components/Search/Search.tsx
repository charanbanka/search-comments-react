import React, { useState, useEffect } from "react";
import useDebounce from "../customHooks/useDebounce";

const API_URL = "https://jsonplaceholder.typicode.com/comments?q=";

interface Comment {
  id: number;
  name: string;
  email: string;
  body: string;
}

const Search: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const useDebounceValue = useDebounce(query, 1000); //search value and delay

  // Fetch data via XHR (as required)
  const fetchResults = (searchText: string) => {
    if (searchText.length <= 3 && searchText.length != 0) return; // Requirement: Ignore short inputs

    setLoading(true);
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${API_URL}${searchText}`, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const data: Comment[] = JSON.parse(xhr.responseText);
        setResults(data.slice(0, 20)); // Requirement: Limit to 20 results
        setLoading(false);
      }
    };
    xhr.send();
  };

  // Handle input change with debounce effect
  useEffect(() => {
    let errorValue = "";
    if (useDebounceValue.length > 3) {
      fetchResults(useDebounceValue);
    } else {
      if (useDebounceValue) errorValue = "Please Enter Atleast 4 characters!";
      if (useDebounceValue == "") fetchResults("");
    }
    setError(errorValue);
  }, [useDebounceValue]);

  return (
    <div className="search-container">
      <div className="search-main">
        <div className="search-field">
          <input
            type="text"
            placeholder="Search comments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {error && <span className="text-danger">{error}</span>}
        </div>
        <div>
          <button onClick={() => fetchResults(query)}>Search</button>
        </div>
      </div>
      {loading && <p>Loading Comments...</p>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Sr.No</th>
              <th>Name</th>
              <th>Email</th>
              <th>Body</th>
            </tr>
          </thead>
          <tbody>
            {results.length > 0 ? (
              results?.map((item, idx) => {
                return (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>
                      {item.body.length > 64
                        ? item.body.substring(0, 64) + "..."
                        : item.body}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td>No Comments...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Search;
