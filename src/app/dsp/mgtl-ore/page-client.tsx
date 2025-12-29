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
import { AlertCircle, Package } from "lucide-react";
import { NoResults } from "@/components/NoResults";
import { api } from "@/trpc/react";

export function MgtlOrePageClient() {
  const [mgtlOre] = api.dispatcher.mgtlOre.getAll.useSuspenseQuery();

  return (
    <>
      {/* Form Section */}
      <Card className="mb-6 shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center gap-2">
            <Package className="text-primary h-6 w-6" />
            <div>
              <CardTitle className="text-xl">Въвеждане на данни</CardTitle>
              <CardDescription>
                Добавяне на нови записи за извоза на руда
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Формата за въвеждане на данни за извоза на руда ще бъде
            имплементирана в следващ етап.
          </p>
        </CardContent>
      </Card>

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
                    <TableHead>Дата</TableHead>
                    <TableHead>Извоз 1</TableHead>
                    <TableHead>МГТЛ 1</TableHead>
                    <TableHead>Извоз 3</TableHead>
                    <TableHead>МГТЛ 3</TableHead>
                    <TableHead>Извоз 4</TableHead>
                    <TableHead>МГТЛ 4</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mgtlOre.map((record) => (
                    <TableRow key={record.Id} className="hover:bg-muted/50">
                      <TableCell>{record.OperDate}</TableCell>
                      <TableCell>{record.Izvoz1 ?? "-"}</TableCell>
                      <TableCell>{record.Mgtl1 ?? "-"}</TableCell>
                      <TableCell>{record.Izvoz3 ?? "-"}</TableCell>
                      <TableCell>{record.Mgtl3 ?? "-"}</TableCell>
                      <TableCell>{record.Izvoz4 ?? "-"}</TableCell>
                      <TableCell>{record.Mgtl4 ?? "-"}</TableCell>
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
