import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-2"
      role="search"
    >
      <Input
        type="search"
        placeholder="Search for anything"
        aria-label="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="h-9 rounded-full border-zinc-700 bg-zinc-900/80 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full border border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
      >
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
