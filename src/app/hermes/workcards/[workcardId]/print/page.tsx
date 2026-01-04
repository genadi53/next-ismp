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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" label="Зареждане на работна карта..." showLabel />
      </div>
    );
  }

  if (!workcard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl text-muted-foreground">Работната карта не е намерена</p>
      </div>
    );
  }

  const dlacnost = "Шофьор,теж.авт./>25т,автомонт.";
  const smena = "Редовна";
  const codeAction = "Ремонт на автосамосвал";

  return (
    <div
      id="print-workcard"
      className="w-full h-full flex flex-col py-8 px-0 mx-0 max-w-5xl"
    >
      <div className="flex flex-row items-center px-4">
        <div className="flex-start">
          {format(new Date(workcard.Date), "dd/MM/yyyy, HH:mm")}
        </div>
        <div className="flex-1 flex items-center justify-center">
          Отдел ИСМП РК Елаците Мед
        </div>
        <div className="flex flex-col items-end justify-end">
          <div>Приложение № 4</div>
          <div>към ВПОРЗ. чл.10, ал.3.т.2</div>
        </div>
      </div>

      <h1 className="text-xl font-bold text-center pt-8 underline">
        <span className="uppercase">"Елаците - МЕД" АД, </span>
        село <span className="uppercase">Мирково</span>
      </h1>

      <h2 className="text-lg font-bold text-center">
        <span className="uppercase">Работна карта № {workcard.ID}/</span>
        {format(new Date(workcard.Date), "dd.MM.yyyy")} година
      </h2>

      <div className="text-base pt-8">
        За участие на: {workcard.OperatorName} с работен номер{" "}
        {workcard.OperatorId}, на длъжност "{dlacnost}", работна смяна{" "}
        <span className="capitalize">{smena}</span>, в извършването на{" "}
        {codeAction} на автосамосвал с инв. № {workcard.EqmtId}, на{" "}
        {format(new Date(workcard.Date), "dd.MM.yyyy")} година, за времето
        от {workcard.StartTime} до {workcard.EndTime} часа.
      </div>

      <div className="text-base pt-12 text-center">
        Описание на видовете ремонтни работи:
        <ol className="text-start list-decimal list-inside px-16">
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
          <div className="place-self-start ml-4">
            Работник: {workcard.OperatorName}
          </div>
        </div>

        <div className="w-full h-full flex flex-row text-base">
          Механик ТАТ-РАТ: ........................
        </div>
      </div>
    </div>
  );
}

