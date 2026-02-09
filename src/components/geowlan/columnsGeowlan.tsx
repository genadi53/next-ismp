import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Pin, Trash2 } from "lucide-react";
import type { GeowlanAP } from "@/server/repositories/geowlan";
import { convertLocalCoordToGlobal } from "@/lib/geowlanCoordinatesConverter";

type GeowlanActions = {
  edit: (geowlan: GeowlanAP) => void;
  delete: (geowlan: GeowlanAP) => void;
  showOnMap: (geowlan: GeowlanAP) => void;
};

export const geowlanColumns = ({
  actions,
}: {
  actions: GeowlanActions;
}): ColumnDef<GeowlanAP>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "name",
    header: "Име",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "x",
    header: "X координата",
    cell: ({ row }) => <div>{row.getValue("x")}</div>,
  },
  {
    accessorKey: "y",
    header: "Y координата",
    cell: ({ row }) => <div>{row.getValue("y")}</div>,
  },
  {
    accessorKey: "lat",
    header: "Ширина",
    cell: ({ row }) => {
      const x = row.original.x;
      const y = row.original.y;
      if (!x || !y) return <div>-</div>;
      return <div>{convertLocalCoordToGlobal(x, y).lat.toFixed(7)}</div>;
    },
  },
  {
    accessorKey: "lng",
    header: "Дължина",
    cell: ({ row }) => {
      const x = row.original.x;
      const y = row.original.y;
      if (!x || !y) return <div>-</div>;
      return <div>{convertLocalCoordToGlobal(x, y).lng.toFixed(7)}</div>;
    },
  },
  {
    accessorKey: "enabled",
    header: "Статус",
    cell: ({ row }) => {
      const enabled = row.getValue("enabled");
      return (
        <Badge variant={enabled ? "default" : "secondary"}>
          {enabled ? "Активна" : "Неактивна"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Действия",
    cell: ({ row }) => {
      const geowlan = row.original;
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => actions.edit(geowlan)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              actions.showOnMap(geowlan);
            }}
          >
            <Pin className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => actions.delete(geowlan)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

