import Link from "next/link";

import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
  const operators = await api.hermes.operators.getAll();
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Operators
          </h1>
        </div>
        <div>
          {operators.map((operator) => (
            <div key={operator.Id}>
              <h2>{operator.OperatorName}</h2>
            </div>
          ))}
        </div>
      </main>
    </HydrateClient>
  );
}
