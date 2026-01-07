"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import type { RouterConfig } from "@/schemas/mikrotik.schemas";

interface ConfigDialogProps {
  config: RouterConfig | null;
  onSave: (config: RouterConfig) => void;
}

export function ConfigDialog({ config, onSave }: ConfigDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<RouterConfig>({
    ip: config?.ip || "192.168.88.1",
    port: config?.port || "8728",
    username: config?.username || "admin",
    password: config?.password || "",
  });

  const handleSave = () => {
    onSave(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hover-elevate"
          data-testid="button-settings"
        >
          <Settings className="mr-2 h-4 w-4" />
          Настройки
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>MikroTik Конфигурация</DialogTitle>
          <DialogDescription>
            Въведете данните за свързване към вашия MikroTik рутер
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="ip">IP Адрес</Label>
            <Input
              id="ip"
              type="text"
              placeholder="192.168.88.1"
              value={formData.ip}
              onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
              data-testid="input-ip"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="port">API Порт</Label>
            <Input
              id="port"
              type="text"
              placeholder="8728"
              value={formData.port}
              onChange={(e) =>
                setFormData({ ...formData, port: e.target.value })
              }
              data-testid="input-port"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Потребителско име</Label>
            <Input
              id="username"
              type="text"
              placeholder="admin"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              data-testid="input-username"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Парола</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              data-testid="input-password"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-testid="button-cancel"
          >
            Отказ
          </Button>
          <Button onClick={handleSave} data-testid="button-save">
            Запази
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
