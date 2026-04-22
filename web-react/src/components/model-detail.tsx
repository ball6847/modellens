import type { Model } from "@/api";
import { formatContext, formatCost, getModelFeatures } from "@/lib/formatters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ModelDetailProps {
  model: Model;
  onClose: () => void;
}

export function ModelDetail({ model, onClose }: ModelDetailProps) {
  const features = getModelFeatures(model);

  const colorMap: Record<string, string> = {
    Tools: "bg-blue-600",
    Reasoning: "bg-purple-600",
    Files: "bg-green-600",
    Open: "bg-orange-600",
    Temperature: "bg-gray-600",
  };

  const fields: [string, string | React.ReactNode][] = [
    ["Provider", model.provider_id],
    ["Name", model.name],
    ["ID", <code key="id" className="text-xs text-gray-500">{model.id}</code>],
    ["Family", model.family ?? "—"],
    ["Context Window", formatContext(model.limit?.context)],
    ["Output Limit", formatContext(model.limit?.output)],
    ["Input Cost", formatCost(model.cost?.input)],
    ["Output Cost", formatCost(model.cost?.output)],
    [
      "Input Modalities",
      model.modalities?.input?.length ? model.modalities.input.join(", ") : "—",
    ],
    [
      "Output Modalities",
      model.modalities?.output?.length ? model.modalities.output.join(", ") : "—",
    ],
    [
      "Features",
      features.length > 0
        ? features.map((f) => (
            <Badge key={f} className={`${colorMap[f] || "bg-gray-600"} text-white mr-1`}>
              {f}
            </Badge>
          ))
        : "—",
    ],
    ["Knowledge Cutoff", model.knowledge ?? "—"],
    ["Release Date", model.release_date ?? "—"],
    ["Last Updated", model.last_updated ?? "—"],
  ];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{model.name}</DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          {fields.map(([label, value]) => (
            <div key={label}>
              <span className="text-xs text-gray-500 font-medium block">
                {label}
              </span>
              <div className="mt-0.5">{value}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
