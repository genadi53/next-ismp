"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SignalStrengthBar } from "./SignalStrengthBar";
import { CCQBadge } from "./CCQBadge";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Client } from "@/schemas/mikrotik.schemas";

interface ClientTableProps {
  clients: Client[];
}

type SortField = keyof Client;
type SortDirection = "asc" | "desc";

export function ClientTable({ clients }: ClientTableProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedClients = [...clients].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <TableHead>
      <Button
        variant="ghost"
        size="sm"
        className="hover-elevate -ml-3 h-8"
        onClick={() => handleSort(field)}
        data-testid={`sort-${field}`}
      >
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );

  return (
    <div className="border-border overflow-hidden rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <SortableHeader field="name">Устройство</SortableHeader>
              <TableHead>MAC Адрес</TableHead>
              <TableHead>IP Адрес</TableHead>
              <TableHead>Интерфейс</TableHead>
              <SortableHeader field="signalStrength">Сигнал</SortableHeader>
              <TableHead>CCQ (TX/RX)</TableHead>
              <SortableHeader field="downloadSpeed">Download</SortableHeader>
              <SortableHeader field="uploadSpeed">Upload</SortableHeader>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedClients.map((client, index) => (
              <TableRow
                key={client.id}
                className={index % 2 === 0 ? "bg-card" : "bg-muted/20"}
                data-testid={`client-row-${client.id}`}
              >
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell className="text-muted-foreground font-mono text-sm">
                  {client.macAddress}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {client.ipAddress}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {client.interface}
                  </Badge>
                </TableCell>
                <TableCell className="min-w-[180px]">
                  <SignalStrengthBar strength={client.signalStrength} />
                </TableCell>
                <TableCell>
                  <CCQBadge tx={client.ccqTx} rx={client.ccqRx} />
                </TableCell>
                <TableCell className="font-mono text-sm tabular-nums">
                  {client.downloadSpeed.toFixed(1)} Mbps
                </TableCell>
                <TableCell className="font-mono text-sm tabular-nums">
                  {client.uploadSpeed.toFixed(1)} Mbps
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        client.connected ? "bg-chart-2" : "bg-muted-foreground"
                      }`}
                    />
                    <span className="text-muted-foreground text-sm">
                      {client.connected ? "Свързан" : "Изключен"}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
