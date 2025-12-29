export type Permission = {
  ID: number;
  Username: string;
  main_menu: string;
  main_menuName: string;
  submenu: string | null;
  submenuName: string | null;
  action: string;
  ordermenu: number | null;
  specialPermisions: string | null;
  DMAAdmins: number | null;
  Active: number | null;
  IsDispatcher: number | null;
  Departmant: string | null;
  ro: number | null;
  lrd: string | null;
};

export type CreatePermissionInput = {
  Username: string;
  main_menu: string;
  main_menuName: string;
  submenu: string | null;
  submenuName: string | null;
  action: string;
  ordermenu: number | null;
  specialPermisions: string | null;
  DMAAdmins: number | null;
  Active: number | null;
  IsDispatcher: number | null;
  Departmant: string | null;
  ro: number | null;
};

export type UpdatePermissionInput = CreatePermissionInput;

// export type DeletePermissionInput = ;
