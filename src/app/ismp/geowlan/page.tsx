"use client";

import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";
import { GeowlanPageClient } from "./page-client";

export default function GeowlanPage() {
  return (
    <AppLayout>
      <Container
        title="Geowlan Точки"
        description="Управление на Geowlan точки и достъпни точки"
        noMaxWidth
      >
        <GeowlanPageClient />
      </Container>
    </AppLayout>
  );
}

