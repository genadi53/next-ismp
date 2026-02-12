import type { RequestRepair } from "@/server/repositories/dispatcher/types.repairs";

const colorHexs = {
  title: "#008000",
  border: "#1a252f",
  excavMain: "#BDD6EE",
  th: "#D5E0CC",
  otherMain: "#B1B5AE",
  drillMain: "#A8D08D",
};

const styles = {
  tr: `border:1px solid ${colorHexs.border};padding:2px 6px;font-weight:bold;text-align:center;margin:0;line-height:1.2;`,
  text: "font-size:11px;padding:0;margin:0;line-height:1.2;",
  td: `border-right:1px solid ${colorHexs.border};text-align:center;padding:2px 6px;margin:0;line-height:1.2;`,
  tdLast: `border-right:1px solid ${colorHexs.border};text-align:center;padding:2px 6px;margin:0;line-height:1.2;`,
  borderY: `border-top:1px solid ${colorHexs.border}; border-bottom:1px solid ${colorHexs.border};`,
};

/**
 * Builds an HTML email for repair requests, matching the
 * standard report styling with dark headers and organized sections.
 */
export function buildRepairRequestsEmailTemplate(
  requests: RequestRepair[],
  date: string,
): string {
  const orderedRequests = requests.sort((a, b) => {
    return (
      new Date(a.RequestDate).getTime() - new Date(b.RequestDate).getTime()
    );
  });

  // Separate requests by equipment type
  const excavatorRequests = requests.filter(
    (r) => r.EquipmentType === "1" || r.EquipmentType === null,
  );
  const drillRequests = requests.filter((r) => r.EquipmentType === "2");
  const otherRequests = requests.filter(
    (r) =>
      r.EquipmentType !== "1" &&
      r.EquipmentType !== "2" &&
      r.EquipmentType !== null,
  );

  const currentDate = new Date().toLocaleString("bg-BG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const firstEdited = orderedRequests[0]?.RequestDate ?? currentDate;
  const firstEditedBy = orderedRequests[0]?.addUser ?? "";
  const lastEdited =
    orderedRequests[orderedRequests.length - 1]?.lrd ?? currentDate;
  const lastEditedBy =
    orderedRequests[orderedRequests.length - 1]?.addUser ?? "";

  // Excavators section
  const theadExcavators = `
    <tr style="${styles.tr}">
      <th style="${styles.td}">Багер</th>
      <th style="${styles.td}">Заявка</th>
      <th style="${styles.tdLast}">Статус</th>
    </tr>`;

  const excavatorRows =
    excavatorRequests.length > 0 &&
    excavatorRequests
      .map((request) => {
        const formattedRequest =
          request.RequestRemont?.replace(/is\|\|mp/g, ";") ?? "";

        return `
            <tr>
              <td style="${styles.td} ${styles.borderY}">${escapeHtml(request.Equipment)}</td>
              <td style="${styles.td} ${styles.borderY}">${escapeHtml(formattedRequest)}</td>
              <td style="${styles.tdLast} ${styles.borderY}"></td>
            </tr>`;
      })
      .join("");

  // Drills section
  const theadDrills = `
    <tr style="${styles.tr}">
      <th style="${styles.td} ${styles.borderY}">Сонда</th>
      <th style="${styles.td} ${styles.borderY}">Бр.сондажи</th>
      <th style="${styles.td} ${styles.borderY}">Заявка</th>
      <th style="${styles.tdLast} ${styles.borderY}">Статус</th>
    </tr>`;

  const drillRows =
    drillRequests.length > 0 &&
    drillRequests
      .map((request) => {
        const formattedRequest =
          request.RequestRemont?.replace(/is\|\|mp/g, ";") ?? "";
        const drillHoles = request.DrillHoles_type ?? "-";
        return `
            <tr>
              <td style="${styles.td} ${styles.borderY}">${escapeHtml(request.Equipment)}</td>
              <td style="${styles.td} ${styles.borderY};text-align:center;">${escapeHtml(drillHoles)}</td>
              <td style="${styles.td} ${styles.borderY}">${escapeHtml(formattedRequest)}</td>
              <td style="${styles.tdLast} ${styles.borderY}"></td>
            </tr>`;
      })
      .join("");

  // Others section
  const theadOthers = `
    <tr style="${styles.tr}">
      <th style="${styles.td} ${styles.borderY}">Секция</th>
      <th style="${styles.td} ${styles.borderY}">Заявка</th>
      <th style="${styles.tdLast} ${styles.borderY}">Статус</th>
    </tr>`;

  const otherRows =
    otherRequests.length > 0 &&
    otherRequests
      .map((request) => {
        const formattedRequest =
          request.RequestRemont?.replace(/is\|\|mp/g, ";") ?? "";
        return `
            <tr>
              <td style="${styles.td} ${styles.borderY}">${escapeHtml(request.Equipment)}</td>
              <td style="${styles.td} ${styles.borderY}">${escapeHtml(formattedRequest)}</td>
              <td style="${styles.tdLast} ${styles.borderY}"></td>
            </tr>`;
      })
      .join("");

  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Заявки за ремонти</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11px; margin: 0; padding: 20px; }
          table { border-collapse: collapse; }
          table td, table th { padding: 2px 6px; margin: 0; line-height: 1.2; }
        </style>
      </head>
      <body>
        ${
          requests.length > 0 &&
          `
        <h2 style="color:${colorHexs.title};font-size:14px;font-weight:bold;">Заявки за ремонти за дата ${escapeHtml(date)}</h2>
        <p style="${styles.text}">Записана в: <strong>${escapeHtml(firstEdited)}</strong> създадена от: <strong>${escapeHtml(firstEditedBy)}</strong></p>
        <p style="${styles.text}">Последна редакция в: <strong>${escapeHtml(lastEdited)}</strong> от: <strong>${escapeHtml(lastEditedBy)}</strong></p>
        `
        }
        
        <br></br>
        ${
          excavatorRequests.length > 0
            ? `
          <table cellpadding="0" cellspacing="0" style="min-width:200px;border:1px solid ${colorHexs.border};margin-bottom:20px;border-collapse:collapse;">
            <thead>
              <tr style="background-color:${colorHexs.excavMain};font-size:12px;font-weight:bold;">
                <th colspan="3" style="padding:2px 6px;border-bottom:1px solid ${colorHexs.border};margin:0;line-height:1.2;">Багери</th>
              </tr>
              ${theadExcavators}
            </thead>
            <tbody>${excavatorRows}</tbody>
          </table>
          `
            : ""
        }
        <br></br>
        ${
          drillRequests.length > 0
            ? `
          <table cellpadding="0" cellspacing="0" style="width:550px;border:1px solid ${colorHexs.border};margin-bottom:20px;border-collapse:collapse;">
            <thead>
              <tr style="background-color:${colorHexs.drillMain};font-size:12px;font-weight:bold;">
                <th colspan="4" style="padding:2px 6px;border-bottom:1px solid ${colorHexs.border};margin:0;line-height:1.2;">Сонди</th>
              </tr>
              ${theadDrills}
            </thead>
            <tbody>${drillRows}</tbody>
          </table>
          `
            : ""
        }
        <br></br>
        ${
          otherRequests.length > 0
            ? `
          <table cellpadding="0" cellspacing="0" style="width:550px;border:1px solid ${colorHexs.border};margin-bottom:20px;border-collapse:collapse;">
            <thead>
              <tr style="background-color:${colorHexs.otherMain};font-size:12px;font-weight:bold;">
                <th colspan="3" style="padding:2px 6px;border-bottom:1px solid ${colorHexs.border};margin:0;line-height:1.2;">ДРУГИ</th>
              </tr>
              ${theadOthers}
            </thead>
            <tbody>${otherRows}</tbody>
          </table>
          `
            : ""
        }
          
          ${
            requests.length === 0
              ? `
            <p style="${styles.text}text-align:center;font-size:14px;">
              Няма заявки за ремонти за тази дата.
            </p>`
              : ""
          }
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
