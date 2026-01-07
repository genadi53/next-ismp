"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { MetricCard } from "@/components/mikrotik/MetricCard";
import { ClientTable } from "@/components/mikrotik/ClientTable";
import { LiveIndicator } from "@/components/mikrotik/LiveIndicator";
import { ConfigDialog } from "@/components/mikrotik/ConfigDialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Activity, Gauge, Wifi, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { RouterConfig } from "@/schemas/mikrotik.schemas";

export function MikrotikPageClient() {
  const [lastUpdate, setLastUpdate] = useState<string>("току-що");

  const [status] = api.ismp.mikrotik.getStatus.useSuspenseQuery(undefined, {
    refetchInterval: 3000,
  });

  const [savedConfig] = api.ismp.mikrotik.getConfig.useSuspenseQuery();

  const { data: clients = [], refetch: refetchClients } =
    api.ismp.mikrotik.getClients.useQuery(undefined, {
      refetchInterval: 5000,
      retry: false,
      enabled: status?.connected ?? false,
    });

  const utils = api.useUtils();
  const configMutation = api.ismp.mikrotik.setConfig.useMutation({
    onSuccess: () => {
      utils.ismp.mikrotik.getClients.invalidate();
      utils.ismp.mikrotik.getStatus.invalidate();
      utils.ismp.mikrotik.getConfig.invalidate();
      toast.success("Успешно свързване", {
        description: "Успешно се свързахте с MikroTik рутера",
      });
    },
    onError: (error) => {
      toast.error("Грешка при свързване", {
        description: error.message || "Неуспешна връзка с MikroTik рутера",
      });
    },
  });

  const totalDevices = clients.filter((c) => c.connected).length;
  const avgSignal =
    clients.length > 0
      ? Math.round(
          clients.reduce((acc, c) => acc + c.signalStrength, 0) /
            clients.length,
        )
      : 0;
  const avgCCQ =
    clients.length > 0
      ? Math.round(
          clients.reduce((acc, c) => acc + (c.ccqTx + c.ccqRx) / 2, 0) /
            clients.length,
        )
      : 0;
  const totalBandwidth = clients.reduce(
    (acc, c) => acc + c.downloadSpeed + c.uploadSpeed,
    0,
  );

  const getMetricStatus = (
    value: number,
    thresholds: { good: number; ok: number },
  ) => {
    if (value >= thresholds.good) return "success";
    if (value >= thresholds.ok) return "warning";
    return "error";
  };

  const handleRefresh = async () => {
    setLastUpdate("току-що");
    await refetchClients();
    utils.ismp.mikrotik.getStatus.invalidate();
  };

  const handleConfigSave = (config: RouterConfig) => {
    configMutation.mutate(config);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const seconds = Math.floor((Date.now() % 60000) / 1000);
      setLastUpdate(`преди ${seconds} сек`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const defaultConfig: RouterConfig = {
    ip: "192.168.88.1",
    username: "admin",
    password: "",
    port: "8728",
  };

  return (
    <div className="bg-background min-h-screen">
      <header className="border-border bg-card/95 supports-[backdrop-filter]:bg-card/80 sticky top-0 z-50 border-b backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Wifi className="text-primary h-6 w-6" />
                <h1 className="text-xl font-semibold">MikroTik Мониторинг</h1>
              </div>
              <LiveIndicator lastUpdate={lastUpdate} />
            </div>
            <div className="flex items-center gap-2">
              <ConfigDialog
                config={savedConfig || defaultConfig}
                onSave={handleConfigSave}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="hover-elevate"
                data-testid="button-refresh"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Обнови
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {!status?.connected && (
          <Alert className="mb-6">
            <AlertDescription>
              Не сте свързани с MikroTik рутер. Моля, въведете данните за връзка
              чрез бутона "Настройки".
            </AlertDescription>
          </Alert>
        )}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Общо устройства"
            value={totalDevices}
            icon={Users}
            statusColor="default"
          />
          <MetricCard
            title="Ср. сила на сигнал"
            value={`${avgSignal}%`}
            icon={Activity}
            statusColor={getMetricStatus(avgSignal, { good: 70, ok: 40 })}
          />
          <MetricCard
            title="Среден CCQ"
            value={`${avgCCQ}%`}
            icon={Gauge}
            statusColor={getMetricStatus(avgCCQ, { good: 80, ok: 60 })}
          />
          <MetricCard
            title="Обща честотна лента"
            value={`${totalBandwidth.toFixed(1)} Mbps`}
            icon={Wifi}
            statusColor="default"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Активни клиенти</h2>
            <p className="text-muted-foreground text-sm">
              {totalDevices} {totalDevices === 1 ? "устройство" : "устройства"}
            </p>
          </div>
          <ClientTable clients={clients} />
        </div>
      </main>
    </div>
  );
}
