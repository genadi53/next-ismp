export type Permission = {
  ID: number;
  Username: string;
  main_menu: string | null;
  main_menuName: string | null;
  submenu: string | null;
  submenuName: string | null;
  action: string | null;
  ordermenu: number | null;
  specialPermisions: string | null;
  DMAAdmins: boolean | null;
  Active: boolean | null;
  IsDispatcher: boolean | null;
  Departmant: string | null;
  ro: boolean | null;
};

export type CreatePermissionInput = {
  Username: string;
  main_menu: string | null;
  main_menuName: string | null;
  submenu: string | null;
  submenuName: string | null;
  action: string | null;
  ordermenu: number | null;
  specialPermisions: string | null;
  DMAAdmins: boolean | null;
  Active: boolean | null;
  IsDispatcher: boolean | null;
  Departmant: string | null;
  ro: boolean | null;
};

export type UpdatePermissionInput = CreatePermissionInput;

// export type DeletePermissionInput = ;
