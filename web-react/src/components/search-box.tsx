import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface SearchBoxProps {
  query: string;
  total: number;
  allCount: number;
  onSearch: (query: string) => void;
}

export function SearchBox({ query, total, allCount, onSearch }: SearchBoxProps) {
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== query) {
        onSearch(localQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, query, onSearch]);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between" role="search">
      <Input
        type="text"
        className="w-full sm:max-w-md"
        placeholder="Search models..."
        aria-label="Search models"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
      />
      <span className="whitespace-nowrap text-sm text-gray-600">
        Showing {total.toLocaleString()} of {allCount.toLocaleString()} models
      </span>
    </div>
  );
}
