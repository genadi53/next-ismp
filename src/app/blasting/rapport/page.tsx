"use client";

import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";
import { BlastingRapportPageClient } from "./page-client";

export default function BlastingRapportPage() {
  return (
    <AppLayout>
      <Container
        title="Рапорт за качествена оценка на Взривно Поле"
        description="Данни за оценка на взривното поле"
      >
        <BlastingRapportPageClient />
      </Container>
    </AppLayout>
  );
}
