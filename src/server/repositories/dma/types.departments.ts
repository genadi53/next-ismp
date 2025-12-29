export type DmaDepartment = {
  Id: number;
  Department: string;
  DepMol: string | null;
  DepMolDuty: string | null;
  DeptApproval: string | null;
  DeptApprovalDuty: string | null;
  DepartmentDesc: string | null;
  lrd: Date | null;
  CreatedFrom: string | null;
  LastUpdatedFrom: string | null;
};

export type CreateDmaDepartmentInput = {
  Department: string;
  DepMol: string | null;
  DepMolDuty: string | null;
  DeptApproval: string | null;
  DeptApprovalDuty: string | null;
  DepartmentDesc: string | null;
};

export type UpdateDmaDepartmentInput = CreateDmaDepartmentInput & {
  active: boolean | null;
};

