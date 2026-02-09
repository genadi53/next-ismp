import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../../table/columnHeader";
import type { DmaDepartment } from "@/server/repositories/dma/types.departments";
import { RowActionsDepartments } from "./rowActionsDepartments";

export const departmentsColumns = ({
  actions,
}: {
  actions: Record<"edit" | "delete", (department: DmaDepartment) => void>;
}): ColumnDef<DmaDepartment>[] => [
  {
    accessorKey: "Id",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="ID"
        haveColumnFilter={false}
      />
    ),
  },
  {
    accessorKey: "Department",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Отдел"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const Department: string | null = row.getValue("Department");
      return (
        <div className="wrap-break-words max-w-sm text-sm whitespace-break-spaces">
          {Department}
        </div>
      );
    },
  },
  {
    accessorKey: "DepMol",
    header: "МОЛ",
    cell: ({ row }) => {
      const depMol: string | null = row.getValue("DepMol");
      return (
        <div className="wrap-break-words max-w-sm text-sm whitespace-break-spaces">
          {depMol}
        </div>
      );
    },
  },
  {
    accessorKey: "DepMolDuty",
    header: "Длъжност МОЛ",
    cell: ({ row }) => {
      const depMolDuty: string | null = row.getValue("DepMolDuty");
      return (
        <div className="wrap-break-words max-w-sm text-sm whitespace-break-spaces">
          {depMolDuty}
        </div>
      );
    },
  },
  {
    accessorKey: "DeptApproval",
    header: "Одобрение",
    cell: ({ row }) => {
      const deptApproval: string | null = row.getValue("DeptApproval");
      return (
        <div className="wrap-break-words max-w-sm text-sm whitespace-break-spaces">
          {deptApproval}
        </div>
      );
    },
  },
  {
    accessorKey: "DeptApprovalDuty",
    header: "Длъжност одобрение",
    cell: ({ row }) => {
      const deptApprovalDuty: string | null = row.getValue("DeptApprovalDuty");
      return (
        <div className="wrap-break-words max-w-sm text-sm whitespace-break-spaces">
          {deptApprovalDuty}
        </div>
      );
    },
  },
  {
    accessorKey: "DepartmentDesc",
    header: "Описание",
    cell: ({ row }) => {
      const description: string | null = row.getValue("DepartmentDesc");
      return (
        <div className="wrap-break-words max-w-sm text-sm whitespace-break-spaces">
          {description}
        </div>
      );
    },
  },
  {
    accessorKey: "CreatedFrom",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Създаден от"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const CreatedFrom: string | null = row.getValue("CreatedFrom");
      return (
        <div className="wrap-break-words max-w-sm text-sm whitespace-break-spaces">
          {CreatedFrom?.replaceAll("@ELLATZITE-MED.COM", "")}
        </div>
      );
    },
  },
  {
    accessorKey: "LastUpdatedFrom",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Редактиран от"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const LastUpdatedFrom: string | null = row.getValue("LastUpdatedFrom");
      return (
        <div className="wrap-break-words max-w-sm text-sm whitespace-break-spaces">
          {LastUpdatedFrom?.replaceAll("@ELLATZITE-MED.COM", "")}
        </div>
      );
    },
  },
  {
    accessorKey: "lrd",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Дата редакция"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const lrd: string | null = row.getValue("lrd");
      return (
        <div className="text-sm">
          {lrd && new Date(lrd).toLocaleString("ru")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActionsDepartments row={row} actions={actions} />,
  },
];
