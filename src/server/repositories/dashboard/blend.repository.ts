import { sqlQuery } from "@/server/database/db";
import type { BlendData } from "@/types/dashboard";

/**
 * Get blend data for the current shift.
 * Calculates metal ton, ton, and grade per 15-minute intervals.
 */
export async function getBlendData(): Promise<BlendData[]> {
  return sqlQuery<BlendData>(`
    DECLARE @CurShift INT;
    SELECT @CurShift = MAX(ShiftId) FROM [ISMP_SP_FUNCTION].[dbo].ShiftList();
    
    SELECT [hour] AS [hour],
           SUM(MetalTon) AS MetalTon,
           SUM(Ton) AS Ton,
           ROUND(SUM(MetalTon)/SUM(Ton), 3) AS curGrade,
           ROW_NUMBER() OVER (ORDER BY lrd, hour) AS rrow,
           lrd
    FROM (
      SELECT *,
             CASE WHEN ((Grano=0) AND (Porfo=0) AND (Shisti=0)) THEN ((Graton+Porton+Shiton+NeoprTon)*Cu)
                  ELSE ((Graton+Porton+Shiton)*Cu) END AS MetalTon,
             CASE WHEN ((Grano=0) AND (Porfo=0) AND (Shisti=0)) THEN (Graton+Porton+Shiton+NeoprTon)
                  ELSE (Graton+Porton+Shiton) END AS Ton,
             CASE WHEN [hour] LIKE N'23\\:%' THEN 1 ELSE 2 END AS lrd 
      FROM (
        SELECT
          StdLoads.ShiftId AS ShiftId,
          FORMAT(DATEADD(minute, 15*(DATEDIFF(minute, '20000101', EmptyTimestamp) / 15), '20000101'), N'HH\\:mm') AS [hour], 
          StdLoads.MaterialGroupId,
          Grades.Grade01 AS Cu,
          Grades.Grade06 AS Grano,
          Grades.Grade07 AS Porfo,
          Grades.Grade08 AS Shisti,
          CASE WHEN Grades.Grade06=0 AND Grades.Grade07=0 AND Grades.Grade08=0 THEN TruckMat.MATERIALDEF ELSE 0 END AS NeoprTon,
          ((TruckMat.GRA/TruckMat.TRUCK_SIZE)*(Grades.Grade06*TruckMat.TRUCK_SIZE/100)) AS Graton,
          ((TruckMat.POR/TruckMat.TRUCK_SIZE)*(Grades.Grade07*TruckMat.TRUCK_SIZE/100)) AS Porton,
          ((TruckMat.SHI/TruckMat.TRUCK_SIZE)*(Grades.Grade08*TruckMat.TRUCK_SIZE/100)) AS Shiton
        FROM (
          SELECT * FROM [DBADMINS].[ELLOperational].[std].StdShiftLoads AS StdLoads 
          WHERE shiftid = @CurShift AND StdLoads.MaterialGroupId=270 
        ) AS StdLoads 
        LEFT JOIN (
          SELECT * FROM [DBADMINS].[ELLOperational].[std].StdShiftDumps AS StdDumps 
          WHERE shiftid = @CurShift AND StdDumps.MaterialGroupId=270 
        ) AS StdDumps ON StdLoads.NextShiftDumpId = StdDumps.Id
        LEFT JOIN (
          SELECT * FROM [DBADMINS].[ELLOperational].[std].StdShiftgrade AS Grades 
          WHERE shiftid = @CurShift 
        ) AS Grades ON Grades.Id=StdLoads.GradeId
        LEFT JOIN (
          SELECT
            TruckMat.TRUCK,
            TruckMat.[WYear],
            TruckMat.TRUCK_SIZE,
            TruckMat.GRA,
            TruckMat.GRAP,
            TruckMat.POR,
            TruckMat.PORP,
            TruckMat.SHI,
            TruckMat.SHIP,
            TruckMat.MDP,
            TruckMat.MATERIALDEF
          FROM [ELLDBAdmins].[dbo].TRUCK_MATERIAL_SIZE_NEW AS TruckMat
        ) TruckMat ON (TruckMat.TRUCK=StdLoads.Truck AND YEAR(CAST(LEFT(StdLoads.ShiftId, 6) AS DATE))=TruckMat.[WYear])
        WHERE StdLoads.ShiftId = @CurShift
          AND StdLoads.MaterialGroupId=270 
          AND DumpLocationUnit = N'Трошачка'
      ) AS pp
      WHERE MaterialGroupId=270 
    ) AS pp
    GROUP BY [hour], lrd 
    ORDER BY lrd, [hour]
  `);
}

