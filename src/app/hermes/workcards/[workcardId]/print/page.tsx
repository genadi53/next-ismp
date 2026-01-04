"use client";

import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default function PrintWorkcardPage() {
  const params = useParams<{ workcardId: string }>();
  const workcardId = parseInt(params?.workcardId ?? "0");

  const { data: workcard, isLoading } = api.hermes.workcards.getById.useQuery({
    id: workcardId,
  });

  useEffect(() => {
    if (workcard) {
      // Give time for rendering before printing
      const timeout = setTimeout(() => {
        window.print();
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [workcard]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <LoadingSpinner
          size="lg"
          label="Зареждане на работна карта..."
          showLabel
        />
      </div>
    );
  }

  if (!workcard) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-muted-foreground text-xl">
          Работната карта не е намерена
        </p>
      </div>
    );
  }

  const dlacnost = "Шофьор,теж.авт./>25т,автомонт.";
  const smena = "Редовна";
  const codeAction = "Ремонт на автосамосвал";

  return (
    <div
      id="print-workcard"
      className="mx-0 flex h-full w-full max-w-5xl flex-col px-0 py-8"
    >
      <div className="flex flex-row items-center px-4">
        <div className="flex-start">
          {format(new Date(workcard.Date), "dd/MM/yyyy, HH:mm")}
        </div>
        <div className="flex flex-1 items-center justify-center">
          Отдел ИСМП РК Елаците Мед
        </div>
        <div className="flex flex-col items-end justify-end">
          <div>Приложение № 4</div>
          <div>към ВПОРЗ. чл.10, ал.3.т.2</div>
        </div>
      </div>

      <h1 className="pt-8 text-center text-xl font-bold underline">
        <span className="uppercase">"Елаците - МЕД" АД, </span>
        село <span className="uppercase">Мирково</span>
      </h1>

      <h2 className="text-center text-lg font-bold">
        <span className="uppercase">Работна карта № {workcard.Id}/</span>
        {format(new Date(workcard.Date), "dd.MM.yyyy")} година
      </h2>

      <div className="pt-8 text-base">
        За участие на: {workcard.OperatorName} с работен номер{" "}
        {workcard.OperatorId}, на длъжност "{dlacnost}", работна смяна{" "}
        <span className="capitalize">{smena}</span>, в извършването на{" "}
        {codeAction} на автосамосвал с инв. № {workcard.EqmtId}, на{" "}
        {format(new Date(workcard.Date), "dd.MM.yyyy")} година, за времето от{" "}
        {workcard.StartTime} до {workcard.EndTime} часа.
      </div>

      <div className="pt-12 text-center text-base">
        Описание на видовете ремонтни работи:
        <ol className="list-inside list-decimal px-16 text-start">
          {workcard.Note?.split("\n").map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-4 pt-20">
        <div className="flex flex-row text-base">
          Отработено време: {workcard.Duration} часа. Работник:{" "}
          {workcard.OperatorName} {workcard.OperatorId} Механик ТАТ-РАТ
          ........................
        </div>

        <div className="grid grid-cols-2 text-base">
          <div>Зам. р-л ТАТ-РАТ: ........................</div>
          <div className="ml-4 place-self-start">
            Работник: {workcard.OperatorName}
          </div>
        </div>

        <div className="flex h-full w-full flex-row text-base">
          Механик ТАТ-РАТ: ........................
        </div>
      </div>
    </div>
  );
}
