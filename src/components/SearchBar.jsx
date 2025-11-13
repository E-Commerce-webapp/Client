import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex" role="search">
      <input
        className="form-control rounded-pill me-2 px-3"
        type="search"
        placeholder="Search for anything"
        aria-label="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button className="btn btn-outline-info rounded-pill px-4" type="submit">
        <i className="bi bi-search"></i> Search
      </button>
    </form>
  );
}
