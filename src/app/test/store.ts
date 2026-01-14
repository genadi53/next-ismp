import { create } from "zustand";

/**
 * Shared period type for higher-level dashboard filters
 * (unrelated to the MiningDashboard test page).
 */
type Period = "shift" | "day" | "month";

/**
 * Granularity used specifically by the MiningDashboard test page
 * (Sheet1Overview + Sheet2Fleet).
 */
type MiningGranularity = "day" | "shift";

/**
 * Active sheet IDs for the MiningDashboard Excel-style tabs.
 * Mirrors the `SheetId` union in `src/app/test/page.tsx`.
 */
type MiningSheetId = 1 | 2 | 3 | 4;

/**
 * State used by Sheet1Overview in `src/app/test/page.tsx`.
 * - Controls the high-level time filters and granularity for the overview.
 */
interface MiningDashboardOverviewSheetState {
  overviewGranularity: MiningGranularity;
  setOverviewGranularity: (granularity: MiningGranularity) => void;
  overviewDatePreset: "today" | "yesterday" | "month";
  setOverviewDatePreset: (preset: "today" | "yesterday" | "month") => void;
  overviewShiftPreset: "shift1" | "shift2" | "night" | "all";
  setOverviewShiftPreset: (
    preset: "shift1" | "shift2" | "night" | "all",
  ) => void;
}

/**
 * State used by Sheet2Fleet in `src/app/test/page.tsx`.
 * - Separated so Fleet can evolve independently from the overview.
 */
interface MiningDashboardFleetSheetState {
  fleetGranularity: MiningGranularity;
  setFleetGranularity: (granularity: MiningGranularity) => void;
}

/**
 * State used by Sheet3Workers in `src/app/test/page.tsx`.
 * - Sorting and expansion of crews/workers in the workers leaderboard + matrix.
 */
type WorkersSortKey =
  | "name"
  | "oreTonnes"
  | "materialMoved"
  | "tkph"
  | "idleTimePercent"
  | "shiftUtilPercent";

interface MiningDashboardWorkersSheetState {
  workersSortKey: WorkersSortKey;
  workersSortDir: "asc" | "desc";
  setWorkersSort: (key: WorkersSortKey) => void;

  /**
   * Expanded crew names in the hierarchical crew → worker → task view.
   */
  expandedCrewNames: string[];
  /**
   * Expanded worker IDs in the hierarchical crew → worker → task view.
   */
  expandedWorkerIds: string[];
  setExpandedCrewNames: (crewNames: string[]) => void;
  setExpandedWorkerIds: (workerIds: string[]) => void;
}

/**
 * State used by Sheet4Detail in `src/app/test/page.tsx`.
 * - Tracks which worker / equipment is selected for the detail view.
 */
interface MiningDashboardDetailSheetState {
  detailSelectedWorkerId: string | null;
  setDetailSelectedWorkerId: (workerId: string | null) => void;
  detailSelectedEquipmentId: string | null;
  setDetailSelectedEquipmentId: (equipmentId: string | null) => void;
}

/**
 * UI state shared across the MiningDashboard test page + SheetTabs,
 * primarily the active Excel-style sheet.
 */
interface MiningDashboardUiState {
  activeSheetId: MiningSheetId;
  setActiveSheetId: (sheetId: MiningSheetId) => void;
}

/**
 * Grouped slice for the MiningDashboard test page.
 * All fields are grouped by the component/sheet that uses them
 * for easier navigation inside the store.
 */
interface MiningDashboardState {
  ui: MiningDashboardUiState;
  overviewSheet: MiningDashboardOverviewSheetState;
  fleetSheet: MiningDashboardFleetSheetState;
  workersSheet: MiningDashboardWorkersSheetState;
  detailSheet: MiningDashboardDetailSheetState;
}

interface DashboardStore {
  /**
   * Generic higher-level period selection (existing functionality).
   * This can be used by other pages and is intentionally kept
   * independent from the MiningDashboard-specific state below.
   */
  period: Period;
  setPeriod: (period: Period) => void;
  selectedPeriod: number | Date;
  setSelectedPeriod: (period: number | Date) => void;

  /**
   * Grouped state for `src/app/test/page.tsx` (MiningDashboard).
   */
  miningDashboard: MiningDashboardState;
}

export const useDashboard = create<DashboardStore>((set) => ({
  // ---------------------------------------------------------------------------
  // Existing generic dashboard period state
  // ---------------------------------------------------------------------------
  period: "shift",
  setPeriod: (period) => set({ period }),
  selectedPeriod: new Date(),
  setSelectedPeriod: (period) => set({ selectedPeriod: period }),

  // ---------------------------------------------------------------------------
  // MiningDashboard (src/app/test/page.tsx) grouped state
  // ---------------------------------------------------------------------------
  miningDashboard: {
    ui: {
      activeSheetId: 1,
      setActiveSheetId: (sheetId) =>
        set((state) => ({
          miningDashboard: {
            ...state.miningDashboard,
            ui: {
              ...state.miningDashboard.ui,
              activeSheetId: sheetId,
            },
          },
        })),
    },

    overviewSheet: {
      overviewGranularity: "shift",
      setOverviewGranularity: (granularity) =>
        set((state) => ({
          miningDashboard: {
            ...state.miningDashboard,
            overviewSheet: {
              ...state.miningDashboard.overviewSheet,
              overviewGranularity: granularity,
            },
          },
        })),
      overviewDatePreset: "today",
      setOverviewDatePreset: (preset) =>
        set((state) => ({
          miningDashboard: {
            ...state.miningDashboard,
            overviewSheet: {
              ...state.miningDashboard.overviewSheet,
              overviewDatePreset: preset,
            },
          },
        })),
      overviewShiftPreset: "shift1",
      setOverviewShiftPreset: (preset) =>
        set((state) => ({
          miningDashboard: {
            ...state.miningDashboard,
            overviewSheet: {
              ...state.miningDashboard.overviewSheet,
              overviewShiftPreset: preset,
            },
          },
        })),
    },

    fleetSheet: {
      fleetGranularity: "shift",
      setFleetGranularity: (granularity) =>
        set((state) => ({
          miningDashboard: {
            ...state.miningDashboard,
            fleetSheet: {
              ...state.miningDashboard.fleetSheet,
              fleetGranularity: granularity,
            },
          },
        })),
    },

    workersSheet: {
      workersSortKey: "oreTonnes",
      workersSortDir: "desc",
      setWorkersSort: (key) =>
        set((state) => {
          const currentKey = state.miningDashboard.workersSheet.workersSortKey;
          const currentDir = state.miningDashboard.workersSheet.workersSortDir;

          // Same key -> toggle direction, new key -> default to desc
          const nextDir =
            key === currentKey && currentDir === "desc" ? "asc" : "desc";

          return {
            miningDashboard: {
              ...state.miningDashboard,
              workersSheet: {
                ...state.miningDashboard.workersSheet,
                workersSortKey: key,
                workersSortDir: nextDir,
              },
            },
          };
        }),

      expandedCrewNames: ["Екип А"],
      expandedWorkerIds: ["w1"],
      setExpandedCrewNames: (crewNames) =>
        set((state) => ({
          miningDashboard: {
            ...state.miningDashboard,
            workersSheet: {
              ...state.miningDashboard.workersSheet,
              expandedCrewNames: crewNames,
            },
          },
        })),
      setExpandedWorkerIds: (workerIds) =>
        set((state) => ({
          miningDashboard: {
            ...state.miningDashboard,
            workersSheet: {
              ...state.miningDashboard.workersSheet,
              expandedWorkerIds: workerIds,
            },
          },
        })),
    },

    detailSheet: {
      detailSelectedWorkerId: null,
      setDetailSelectedWorkerId: (workerId) =>
        set((state) => ({
          miningDashboard: {
            ...state.miningDashboard,
            detailSheet: {
              ...state.miningDashboard.detailSheet,
              detailSelectedWorkerId: workerId,
            },
          },
        })),
      detailSelectedEquipmentId: null,
      setDetailSelectedEquipmentId: (equipmentId) =>
        set((state) => ({
          miningDashboard: {
            ...state.miningDashboard,
            detailSheet: {
              ...state.miningDashboard.detailSheet,
              detailSelectedEquipmentId: equipmentId,
            },
          },
        })),
    },
  },
}));
