"use client";

import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";
import { MonthChecklistPageClient } from "./page-client";

export default function MonthChecklistPage() {
  return (
    <AppLayout>
      <Container
        title="Месечен Контролен Списък"
        description="Управление на месечни задачи и проверки"
      >
        <MonthChecklistPageClient />
      </Container>
    </AppLayout>
  );
}

