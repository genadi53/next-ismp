import { type ReactNode } from "react";

export type NavigationItem = {
  group?: string | undefined;
  title: string;
  path: string;
  icon?: ReactNode;
};

export type SiteConfig = Record<string, NavigationItem[]>;

const SITE_CONFIG = {
  Дашборд: [{ group: "Дашборд", title: "Дашборд", path: "/" }],
  Админ: [
    { group: "Админ", title: "Задаване на права", path: "/admin/permissions" },
    { group: "Админ", title: "Имейл Групи", path: "/admin/mail-groups" },
    {
      group: "Админ",
      title: "Домейн Групи",
      path: "/admin/domain-permissions",
    },
  ],
  Курсове: [{ group: "Курсове", title: "Курсове", path: "/loads" }],
  "Минно Планиране": [
    { group: "Минно Планиране", title: "Месечен План", path: "/mp/month-plan" },
    // {
    //   group: "Минно Планиране",
    //   title: "Линии на напредък",
    //   path: "/mp/month-plan-plines",
    // },
  ],
  ПВР: [
    { group: "ПВР", title: "План Взривяване", path: "/blasting/plan" },
    { group: "ПВР", title: "Работна Среда", path: "/blasting/plan-gas" },
    { group: "ПВР", title: "Рапорт Взривяване", path: "/blasting/rapport" },
  ],
  Склад: [
    { group: "Склад", title: "Артикули", path: "/assets/" },
    { group: "Склад", title: "Клиенти", path: "/assets/clients" },
    { group: "Склад", title: "Транзакции", path: "/assets/transactions" },
    { group: "Склад", title: "Отчети", path: "/assets/reports" },
  ],
  ДМА: [
    { group: "ДМА", title: "Актове", path: "/dma/documents" },
    { group: "ДМА", title: "Активи", path: "/dma/assets" },
    { group: "ДМА", title: "Доставчици", path: "/dma/suppliers" },
    { group: "ДМА", title: "Дирекции", path: "/dma/departments" },
    { group: "ДМА", title: "Отчети", path: "/dma/reports" },
    {
      group: "ДМА",
      title: "Отключване на месец",
      path: "/dma/act-alloweddate",
    },
  ],
  Отчети: [
    {
      group: "Отчети",
      title: "Отчети Тест",
      path: "/test",
    },
    { group: "Отчети", title: "Бюлетин", path: "/reports/buletin" },
    { group: "Отчети", title: "Дашборд", path: "/reports/dashboards-new" },
    { group: "Отчети", title: "Регистър", path: "/reports/registry" },
  ],
  Диспечери: [
    {
      group: "Диспечери",
      title: "Предстарова проверка",
      path: "/dsp/prestart",
    },

    { group: "Диспечери", title: "Извоз на Руда", path: "/dsp/mgtl-ore" },
    {
      group: "Диспечери",
      title: "Заявки ремонт",
      path: "/dsp/requests-repairs",
    },
    { group: "Диспечери", title: "График Диспечери", path: "/dsp/schedule" },
    {
      group: "Диспечери",
      title: "Сутрешен отчет",
      path: "/dsp/morning-report",
    },
  ],
  ISMP: [
    { group: "ISMP", title: "ИСМП", path: "/ismp/logs" },
    { group: "ISMP", title: "Месечен Чеклист", path: "/ismp/month-checklist" },
    { group: "ISMP", title: "Geowlan", path: "/ismp/geowlan" },
  ],
  Хермес: [
    {
      group: "Хермес",
      title: "Номенклатура машини",
      path: "/hermes/equipments",
    },
    {
      group: "Хермес",
      title: "Номенклатура оператори",
      path: "/hermes/operators",
    },
    { group: "Хермес", title: "Работни карти", path: "/hermes/workcards" },
    {
      group: "Хермес",
      title: "Заработки машини",
      path: "/hermes/zarabotki-equipments",
    },
  ],
} as const;

export type SITE_PATH =
  (typeof SITE_CONFIG)[keyof typeof SITE_CONFIG][number]["path"];

export default SITE_CONFIG;
