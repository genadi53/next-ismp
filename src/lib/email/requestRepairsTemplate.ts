import type { RequestRepair } from "@/server/repositories/dispatcher/types.repairs";

/**
 * Builds an HTML email for repair requests, matching the
 * standard report styling with dark headers and organized sections.
 */
export function buildRepairRequestsEmailTemplate(
  requests: RequestRepair[],
  date: string,
): string {
  // Separate requests by equipment type
  const excavatorRequests = requests.filter(
    (r) => r.EquipmentType === "1" || r.EquipmentType === null,
  );
  const drillRequests = requests.filter((r) => r.EquipmentType === "2");
  const otherRequests = requests.filter(
    (r) => r.EquipmentType !== "1" && r.EquipmentType !== "2" && r.EquipmentType !== null,
  );

  const currentDate = new Date().toLocaleString("bg-BG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const lastEdited = requests[0]?.lrd ?? currentDate;
  const lastEditedBy = requests[0]?.addUser ?? "";

  // Excavators section
  const theadExcavators = `
    <tr style="background-color:#2c3e50;color:#ffffff;">
      <th style="border:1px solid #1a252f;padding:6px 8px;text-align:left;font-weight:bold;">Багер</th>
      <th style="border:1px solid #1a252f;padding:6px 8px;text-align:left;font-weight:bold;">Заявка</th>
      <th style="border:1px solid #1a252f;padding:6px 8px;text-align:left;font-weight:bold;">Статус</th>
    </tr>`;

  const excavatorRows =
    excavatorRequests.length > 0
      ? excavatorRequests
          .map((request, index) => {
            const formattedRequest =
              request.RequestRemont?.replace(/is\|\|mp/g, ";") ?? "";
            const bgColor = index % 2 === 0 ? "#ffffff" : "#f8f9fa";
            const status = request.SentReportOn ? "Изпратен" : "Чака";

            return `
    <tr style="background-color:${bgColor};">
      <td style="border:1px solid #dee2e6;padding:6px 8px;">${escapeHtml(request.Equipment)}</td>
      <td style="border:1px solid #dee2e6;padding:6px 8px;">${escapeHtml(formattedRequest)}</td>
      <td style="border:1px solid #dee2e6;padding:6px 8px;">${escapeHtml(status)}</td>
    </tr>`;
          })
          .join("")
      : `
    <tr>
      <td colspan="3" style="border:1px solid #dee2e6;padding:8px;text-align:center;color:#6c757d;">
        Няма заявки
      </td>
    </tr>`;

  // Drills section
  const theadDrills = `
    <tr style="background-color:#2c3e50;color:#ffffff;">
      <th style="border:1px solid #1a252f;padding:6px 8px;text-align:left;font-weight:bold;">Сонда</th>
      <th style="border:1px solid #1a252f;padding:6px 8px;text-align:left;font-weight:bold;">Бр.сондажи</th>
      <th style="border:1px solid #1a252f;padding:6px 8px;text-align:left;font-weight:bold;">Заявка</th>
      <th style="border:1px solid #1a252f;padding:6px 8px;text-align:left;font-weight:bold;">Статус</th>
    </tr>`;

  const drillRows =
    drillRequests.length > 0
      ? drillRequests
          .map((request, index) => {
            const formattedRequest =
              request.RequestRemont?.replace(/is\|\|mp/g, ";") ?? "";
            const bgColor = index % 2 === 0 ? "#ffffff" : "#f8f9fa";
            const status = request.SentReportOn ? "Изпратен" : "Чака";
            const drillHoles = request.DrillHoles_type ?? "-";

            return `
    <tr style="background-color:${bgColor};">
      <td style="border:1px solid #dee2e6;padding:6px 8px;">${escapeHtml(request.Equipment)}</td>
      <td style="border:1px solid #dee2e6;padding:6px 8px;text-align:center;">${escapeHtml(drillHoles)}</td>
      <td style="border:1px solid #dee2e6;padding:6px 8px;">${escapeHtml(formattedRequest)}</td>
      <td style="border:1px solid #dee2e6;padding:6px 8px;">${escapeHtml(status)}</td>
    </tr>`;
          })
          .join("")
      : `
    <tr>
      <td colspan="4" style="border:1px solid #dee2e6;padding:8px;text-align:center;color:#6c757d;">
        Няма заявки
      </td>
    </tr>`;

  // Others section
  const theadOthers = `
    <tr style="background-color:#2c3e50;color:#ffffff;">
      <th style="border:1px solid #1a252f;padding:6px 8px;text-align:left;font-weight:bold;">Заявка</th>
      <th style="border:1px solid #1a252f;padding:6px 8px;text-align:left;font-weight:bold;">Секция</th>
      <th style="border:1px solid #1a252f;padding:6px 8px;text-align:left;font-weight:bold;">Статус</th>
    </tr>`;

  const otherRows =
    otherRequests.length > 0
      ? otherRequests
          .map((request, index) => {
            const formattedRequest =
              request.RequestRemont?.replace(/is\|\|mp/g, ";") ?? "";
            const bgColor = index % 2 === 0 ? "#ffffff" : "#f8f9fa";
            const status = request.SentReportOn ? "Изпратен" : "Чака";

            return `
    <tr style="background-color:${bgColor};">
      <td style="border:1px solid #dee2e6;padding:6px 8px;">${escapeHtml(formattedRequest)}</td>
      <td style="border:1px solid #dee2e6;padding:6px 8px;">${escapeHtml(request.Equipment)}</td>
      <td style="border:1px solid #dee2e6;padding:6px 8px;">${escapeHtml(status)}</td>
    </tr>`;
          })
          .join("")
      : `
    <tr>
      <td colspan="3" style="border:1px solid #dee2e6;padding:8px;text-align:center;color:#6c757d;">
        Няма заявки
      </td>
    </tr>`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Заявки за ремонти</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 13px;
      line-height: 1.4;
      color: #212529;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }
    .header-bar {
      background-color: #1a252f;
      color: #ffffff;
      padding: 8px 12px;
      font-size: 12px;
    }
    .content {
      padding: 20px;
    }
    .section-title {
      background-color: #34495e;
      color: #ffffff;
      padding: 8px 12px;
      margin: 20px 0 10px 0;
      font-weight: bold;
      font-size: 14px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <strong>записана из:</strong> ${escapeHtml(currentDate)} | <strong>последна редакция в:</strong> ${escapeHtml(lastEdited)} ОТ: ${escapeHtml(lastEditedBy)}
  </div>
  
  <div class="content">
    <h2 style="color:#2c3e50;margin:0 0 16px 0;font-size:18px;font-weight:bold;">Заявки за ремонти за дата ${escapeHtml(date)}</h2>
    
    ${
      excavatorRequests.length > 0
        ? `
    <div class="section-title">Багери</div>
    <table>
      <thead>${theadExcavators}</thead>
      <tbody>${excavatorRows}</tbody>
    </table>
    `
        : ""
    }
    
    ${
      drillRequests.length > 0
        ? `
    <div class="section-title">Сонди</div>
    <table>
      <thead>${theadDrills}</thead>
      <tbody>${drillRows}</tbody>
    </table>
    `
        : ""
    }
    
    ${
      otherRequests.length > 0
        ? `
    <div class="section-title">ДРУГИ</div>
    <table>
      <thead>${theadOthers}</thead>
      <tbody>${otherRows}</tbody>
    </table>
    `
        : ""
    }
    
    ${
      requests.length === 0
        ? `
    <p style="text-align:center;color:#6c757d;padding:20px;">Няма заявки за ремонти за тази дата.</p>
    `
        : ""
    }
  </div>
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
