import { format } from "date-fns";
import type { Load } from "@/server/repositories/loads/types.loads";

/**
 * Builds an HTML table for the loads report email, matching the columns
 * from the send page (ID, На дата, За смяна, Багер, Камион, etc.).
 */
export function buildLoadsReportHtml(loads: Load[]): string {
  const thead = `
    <tr>
      <th style="border:1px solid #ccc;padding:8px;text-align:left;">ID</th>
      <th style="border:1px solid #ccc;padding:8px;text-align:left;">На дата</th>
      <th style="border:1px solid #ccc;padding:8px;text-align:left;">За смяна</th>
      <th style="border:1px solid #ccc;padding:8px;text-align:left;">Багер</th>
      <th style="border:1px solid #ccc;padding:8px;text-align:left;">Камион</th>
      <th style="border:1px solid #ccc;padding:8px;text-align:left;">Е добавен към</th>
      <th style="border:1px solid #ccc;padding:8px;text-align:left;">Е премахнат от</th>
      <th style="border:1px solid #ccc;padding:8px;text-align:left;">Брой</th>
      <th style="border:1px solid #ccc;padding:8px;text-align:left;">Потребител</th>
    </tr>`;

  const rows = loads
    .map((load) => {
      const addDate =
        load.Adddate instanceof Date
          ? format(load.Adddate, "dd.MM.yyyy")
          : load.Adddate
            ? format(new Date(load.Adddate), "dd.MM.yyyy")
            : "-";
      return `
    <tr>
      <td style="border:1px solid #ccc;padding:8px;">${load.id}</td>
      <td style="border:1px solid #ccc;padding:8px;">${addDate}</td>
      <td style="border:1px solid #ccc;padding:8px;text-align:center;">${load.Shift ?? "-"}</td>
      <td style="border:1px solid #ccc;padding:8px;text-align:center;">${escapeHtml(load.Shovel)}</td>
      <td style="border:1px solid #ccc;padding:8px;text-align:center;">${escapeHtml(load.Truck)}</td>
      <td style="border:1px solid #ccc;padding:8px;text-align:center;">${escapeHtml(load.AddMaterial ?? "-")}</td>
      <td style="border:1px solid #ccc;padding:8px;text-align:center;">${escapeHtml(load.RemoveMaterial ?? "-")}</td>
      <td style="border:1px solid #ccc;padding:8px;text-align:center;">${load.Br ?? "-"}</td>
      <td style="border:1px solid #ccc;padding:8px;">${escapeHtml(load.userAdded ?? "-")}</td>
    </tr>`;
    })
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Отчет редакция курсове</title>
</head>
<body>
  <h2>Отчет за редакция на курсове</h2>
  <table style="border-collapse:collapse;width:100%;">
    <thead>${thead}
    </thead>
    <tbody>${rows}
    </tbody>
  </table>
</body>
</html>`;
}

function escapeHtml(text: string | number): string {
  const s = String(text);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
