"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/spinner";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SendLoadsPageClient() {
  const router = useRouter();
  const utils = api.useUtils();

  const [unsentLoads] = api.loads.loads.getUnsent.useSuspenseQuery();

  const { mutateAsync: sendAll, isPending: isSending } =
    api.loads.loads.sendAll.useMutation({
      onSuccess: (data) => {
        toast.success("Успешно изпратено", {
          description: `Курсовете (${data.count}) са изпратени успешно.`,
        });
        utils.loads.loads.getAll.invalidate();
        utils.loads.loads.getUnsent.invalidate();
        router.push("/loads");
      },
      onError: (error) => {
        toast.error("Грешка при изпращане", {
          description:
            error.message ||
            "Възникна грешка при изпращане на курсовете. Опитайте отново, или се обадете на администратор.",
        });
      },
    });

  const onSend = async () => {
    if (!unsentLoads || unsentLoads.length === 0) {
      toast.error("Няма записи за изпращане", {
        description: "Няма непратени курсове за изпращане.",
      });
      return;
    }

    try {
      await sendAll();
    } catch (error) {
      console.error("Error sending loads:", error);
    }
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          variant={"default"}
          onClick={onSend}
          disabled={isSending || !unsentLoads || unsentLoads.length === 0}
        >
          {isSending ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Изпращане...
            </>
          ) : (
            `Изпрати ${unsentLoads?.length || 0} курса`
          )}
        </Button>
      </div>

      {unsentLoads && unsentLoads.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="w-[100px] border-r border-gray-200">
                  ID
                </TableHead>
                <TableHead className="border-r border-gray-200">
                  На дата
                </TableHead>
                <TableHead className="border-r border-gray-200">
                  За смяна
                </TableHead>
                <TableHead className="border-r border-gray-200">Багер</TableHead>
                <TableHead className="border-r border-gray-200">Камион</TableHead>
                <TableHead className="border-r border-gray-200">
                  Е добавен към
                </TableHead>
                <TableHead className="border-r border-gray-200">
                  Е премахнат от
                </TableHead>
                <TableHead className="border-r border-gray-200">Брой</TableHead>
                <TableHead>Потребител</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unsentLoads.map((load) => (
                <TableRow key={load.id} className="border-b border-gray-200">
                  <TableCell className="border-r border-gray-200">
                    {load.id}
                  </TableCell>
                  <TableCell className="border-r border-gray-200">
                    {load.Adddate
                      ? new Date(load.Adddate).toLocaleDateString("bg-BG")
                      : "-"}
                  </TableCell>
                  <TableCell className="border-r border-gray-200 text-center">
                    {load.Shift}
                  </TableCell>
                  <TableCell className="border-r border-gray-200 text-center">
                    {load.Shovel}
                  </TableCell>
                  <TableCell className="border-r border-gray-200 text-center">
                    {load.Truck}
                  </TableCell>
                  <TableCell className="border-r border-gray-200 text-center">
                    {load.AddMaterial || "-"}
                  </TableCell>
                  <TableCell className="border-r border-gray-200 text-center">
                    {load.RemoveMaterial || "-"}
                  </TableCell>
                  <TableCell className="border-r border-gray-200 text-center">
                    {load.Br ?? "-"}
                  </TableCell>
                  <TableCell>{load.userAdded || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {(!unsentLoads || unsentLoads.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">
          Няма непратени курсове за изпращане.
        </div>
      )}
    </>
  );
}

