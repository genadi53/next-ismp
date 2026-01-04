"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { NoResults } from "@/components/NoResults";
import { api } from "@/trpc/react";
import { MgtlOreForm } from "@/components/dsp/mgtl-ore/MgtlOreForm";

type MgtlOrePageClientProps = {
  isReadOnly?: boolean;
};

export function MgtlOrePageClient({ isReadOnly = false }: MgtlOrePageClientProps) {
  const [mgtlOre] = api.dispatcher.mgtlOre.getAll.useSuspenseQuery();

  const formatNumber = (value: number | null) => {
    if (value === null || value === undefined) return "-";
    return value.toLocaleString("bg-BG", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  };

  return (
    <>
      {/* Form Section */}
      {!isReadOnly && (
        <Card className="mb-6 shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <Package className="text-primary h-6 w-6" />
              <div>
                <CardTitle className="text-xl">Въвеждане извоз руда</CardTitle>
                <CardDescription>
                  Добавяне на нови записи за извоза на руда
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <MgtlOreForm />
          </CardContent>
        </Card>
      )}

      {/* Table Section */}
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">История на записите</CardTitle>
              <CardDescription>
                Преглед на всички въведени данни за извоза на руда
              </CardDescription>
            </div>
            {mgtlOre && (
              <Badge variant="outline" className="text-ell-primary text-sm">
                {mgtlOre.length} {mgtlOre.length === 1 ? "запис" : "записа"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {mgtlOre && mgtlOre.length === 0 && (
            <NoResults
              title="Няма намерени записи"
              description="Все още няма въведени данни за извоза на руда."
              icon={<Package className="text-ell-primary/50 size-12" />}
            />
          )}

          {mgtlOre && mgtlOre.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Извоз 1</TableHead>
                    <TableHead>МГТЛ 1</TableHead>
                    <TableHead>Извоз 3</TableHead>
                    <TableHead>МГТЛ 3</TableHead>
                    <TableHead>Извоз 4</TableHead>
                    <TableHead>МГТЛ 4</TableHead>
                    <TableHead>Общо МГТЛ</TableHead>
                    <TableHead>Дата на редакция</TableHead>
                    <TableHead>Редактор</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mgtlOre.map((record) => (
                    <TableRow key={record.ID} className="hover:bg-muted/50">
                      <TableCell>{record.ID}</TableCell>
                      <TableCell>{record.OperDate?.split(" ")[0]}</TableCell>
                      <TableCell>{formatNumber(record.Izvoz1)}</TableCell>
                      <TableCell>{formatNumber(record.Mgtl1)}</TableCell>
                      <TableCell>{formatNumber(record.Izvoz3)}</TableCell>
                      <TableCell>{formatNumber(record.Mgtl3)}</TableCell>
                      <TableCell>{formatNumber(record.Izvoz4)}</TableCell>
                      <TableCell>{formatNumber(record.Mgtl4)}</TableCell>
                      <TableCell>{formatNumber(record.SumMGTL)}</TableCell>
                      <TableCell>{record.lrd}</TableCell>
                      <TableCell>{record.lrby?.replace(/\(/g, "\n(")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
