import { RouterOSAPI } from "node-routeros";
import type { Client, RouterConfig } from "@/schemas/mikrotik.schemas";

/**
 * MikroTik Service
 *
 * Handles connections to MikroTik routers and fetches client data.
 * Uses on-demand connections (connect → execute → disconnect) for Next.js serverless compatibility.
 */
export class MikroTikService {
  /**
   * Connect to a MikroTik router and execute a function.
   * Automatically handles connection cleanup.
   */
  private async withConnection<T>(
    config: RouterConfig,
    fn: (api: RouterOSAPI) => Promise<T>,
  ): Promise<T> {
    const api = new RouterOSAPI({
      host: config.ip,
      user: config.username,
      password: config.password,
      port: parseInt(config.port) || 8728,
      timeout: 10000,
    });

    try {
      await api.connect();
      return await fn(api);
    } finally {
      await api.close();
    }
  }

  /**
   * Get wireless clients from the router.
   */
  async getWirelessClients(config: RouterConfig): Promise<Client[]> {
    return this.withConnection(config, async (api) => {
      const clients: Client[] = [];
      const registrations = await api.write(
        "/interface/wireless/registration-table/print",
      );

      for (const reg of registrations) {
        const client: Client = {
          id: (reg.interface as string) + "-" + (reg["mac-address"] as string),
          name: (reg.interface as string) || "Unknown",
          macAddress: (reg["mac-address"] as string) || "",
          ipAddress: (reg["last-ip"] as string) || "",
          signalStrength: this.parseSignalStrength(
            reg["signal-strength"] as string | undefined,
          ),
          ccqTx: this.parseCCQ(reg["tx-ccq"] as string | undefined),
          ccqRx: this.parseCCQ(reg["rx-ccq"] as string | undefined),
          uploadSpeed: this.parseSpeed(reg["tx-rate"] as string | undefined),
          downloadSpeed: this.parseSpeed(reg["rx-rate"] as string | undefined),
          interface: (reg.interface as string) || "",
          connected: true,
        };
        clients.push(client);
      }

      return clients;
    });
  }

  /**
   * Get all clients (wireless + DHCP leases).
   */
  async getAllClients(config: RouterConfig): Promise<Client[]> {
    return this.withConnection(config, async (api) => {
      const clients: Client[] = [];

      // Get wireless clients
      const wirelessClients = await this.getWirelessClients(config);
      clients.push(...wirelessClients);

      // Get DHCP leases
      const dhcpLeases = await api.write("/ip/dhcp-server/lease/print");

      for (const lease of dhcpLeases) {
        const macAddress = (lease["mac-address"] as string) || "";
        if (
          (lease.status as string) === "bound" &&
          !clients.find((c) => c.macAddress === macAddress)
        ) {
          const client: Client = {
            id: macAddress || Math.random().toString(),
            name:
              (lease["host-name"] as string) ||
              (lease.address as string) ||
              "Unknown",
            macAddress: macAddress,
            ipAddress: (lease.address as string) || "",
            signalStrength: 0,
            ccqTx: 0,
            ccqRx: 0,
            uploadSpeed: 0,
            downloadSpeed: 0,
            interface: (lease.server as string) || "wired",
            connected: true,
          };
          clients.push(client);
        }
      }

      return clients;
    });
  }

  /**
   * Test connection to router.
   */
  async testConnection(config: RouterConfig): Promise<boolean> {
    try {
      await this.withConnection(config, async (api) => {
        // Just verify connection works by doing a simple query
        await api.write("/system/identity/print");
      });
      return true;
    } catch (error) {
      console.error("MikroTik connection test failed:", error);
      return false;
    }
  }

  /**
   * Parse signal strength from MikroTik format (e.g., "-67dBm") to percentage (0-100).
   */
  private parseSignalStrength(value: string | undefined): number {
    if (!value) return 0;
    const match = value.match(/-?(\d+)/);
    if (match) {
      const dbm = parseInt(match[0]!);
      return Math.min(100, Math.max(0, 100 + dbm));
    }
    return 0;
  }

  /**
   * Parse CCQ (Client Connection Quality) value.
   */
  private parseCCQ(value: string | undefined): number {
    if (!value) return 0;
    const match = value.match(/(\d+)/);
    return match ? parseInt(match[1]!) : 0;
  }

  /**
   * Parse speed from MikroTik format (e.g., "54M", "1.2G") to Mbps.
   */
  private parseSpeed(value: string | undefined): number {
    if (!value) return 0;
    const match = value.match(/([\d.]+)([MG])/);
    if (match) {
      const speed = parseFloat(match[1]!);
      const unit = match[2];
      return unit === "G" ? speed * 1000 : speed;
    }
    return 0;
  }
}

export const mikrotikService = new MikroTikService();
