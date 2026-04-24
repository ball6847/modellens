import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface SearchBoxProps {
  query: string;
  total: number;
  allCount: number;
  onSearch: (query: string) => void;
}

export function SearchBox({ query, onSearch }: SearchBoxProps) {
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== query) {
        onSearch(localQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, query, onSearch]);

  return (
    <Input
      type="text"
      className="w-full sm:max-w-md"
      placeholder="Search models..."
      aria-label="Search models"
      value={localQuery}
      onChange={(e) => setLocalQuery(e.target.value)}
    />
  );
}
