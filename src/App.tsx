import React from "react";
import Search from "./components/Search/Search";
import "./App.css";

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Search Comments</h1>
      <Search />
    </div>
  );
};

export default App;
