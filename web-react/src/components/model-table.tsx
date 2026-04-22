import type { Model, SortField, SortDir } from "@/api";
import { formatContext, formatCost, getModelFeatures } from "@/lib/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const COLUMNS: { key: SortField | "id" | "features"; label: string }[] = [
  { key: "provider", label: "Provider" },
  { key: "name", label: "Name" },
  { key: "id", label: "ID" },
  { key: "context", label: "Context" },
  { key: "input_cost", label: "Input Cost" },
  { key: "output_cost", label: "Output Cost" },
  { key: "features", label: "Features" },
];

interface ModelTableProps {
  models: Model[];
  sortBy: SortField;
  sortDir: SortDir;
  onSort: (sortBy: SortField, sortDir: SortDir) => void;
  onRowClick: (model: Model) => void;
}

export function ModelTable({
  models,
  sortBy,
  sortDir,
  onSort,
  onRowClick,
}: ModelTableProps) {
  const handleHeaderClick = (key: string) => {
    if (key === "id" || key === "features") return;

    const sortKey = key as SortField;
    let dir: SortDir = "asc";
    if (sortBy === sortKey) {
      dir = sortDir === "asc" ? "desc" : "asc";
    }
    onSort(sortKey, dir);
  };

  const renderSortIndicator = (key: string) => {
    if (key !== sortBy) return null;
    return <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  const renderBadges = (m: Model) => {
    const features = getModelFeatures(m);
    if (features.length === 0) return "—";

    const colorMap: Record<string, string> = {
      Tools: "bg-blue-600",
      Reasoning: "bg-purple-600",
      Files: "bg-green-600",
      Open: "bg-orange-600",
      Temperature: "bg-gray-600",
    };

    return features.map((f) => (
      <Badge key={f} className={`${colorMap[f] || "bg-gray-600"} text-white mr-1`}>
        {f}
      </Badge>
    ));
  };

  return (
    <div className="overflow-x-auto mt-4">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 hover:bg-gray-100">
            {COLUMNS.map((col) => {
              const sortable = col.key !== "id" && col.key !== "features";
              return (
                <TableHead
                  key={col.key}
                  className={`text-xs uppercase text-gray-600 ${
                    sortable ? "cursor-pointer select-none" : ""
                  }`}
                  onClick={() => handleHeaderClick(col.key)}
                >
                  {col.label}
                  {renderSortIndicator(col.key)}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map((m) => (
            <TableRow
              key={`${m.provider_id}/${m.id}`}
              className="cursor-pointer"
              onClick={() => onRowClick(m)}
            >
              <TableCell>{m.provider_id}</TableCell>
              <TableCell className="font-medium">{m.name}</TableCell>
              <TableCell className="text-gray-500 font-mono text-xs">
                {m.id}
              </TableCell>
              <TableCell>{formatContext(m.limit?.context)}</TableCell>
              <TableCell>{formatCost(m.cost?.input)}</TableCell>
              <TableCell>{formatCost(m.cost?.output)}</TableCell>
              <TableCell>{renderBadges(m)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
