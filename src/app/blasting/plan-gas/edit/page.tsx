"use client";

import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";
import { PlanGasEditPageClient } from "./page-client";

export default function PlanGasEditPage() {
  return (
    <AppLayout>
      <Container title="Редакция на информация от Дневник за измерване на газовете ФД 8-01-16">
        <PlanGasEditPageClient />
      </Container>
    </AppLayout>
  );
}
