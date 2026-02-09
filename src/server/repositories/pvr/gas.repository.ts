import { mysqlQuery, mysqlTransaction } from "@/server/database/db";
import type {
  GasMeasurement,
  GasMeasurementEdit,
  CreateGasMeasurementInput,
  UpdateGasMeasurementInput,
  GasReference,
  SamplerDetails,
} from "./types.gas";

/**
 * Get gas measurements (last 100).
 */
export async function getGasMeasurements(): Promise<GasMeasurement[]> {
  return mysqlQuery<GasMeasurement>(`
    select xcom_man_measure.GasID,
      gasName,gasType,
      round(GasValue,2) as GasValue,MeasuredFrom,
      MeasuredDuty,MeasuredOn,
      Horizont,xcom_man_measure.lrd,
      xcom_man_measure.lrdFrom,Dimension
      from (xcom_man_measure inner join xcom_l_gases
          on xcom_man_measure.GasID=xcom_l_gases.ID)
          inner join xcom_references as xcRef on xcRef.GasID=xcom_l_gases.ID
          group by MeasuredOn,gasid,MeasuredFrom,Horizont
      order by MeasuredOn desc
      limit 0,100
  `);
}

/**
 * Get gas measurements for editing by date and elevation.
 */
export async function getGasMeasurementsEdit(
  date: string,
  elevation: number,
): Promise<GasMeasurementEdit[]> {
  return mysqlQuery<GasMeasurementEdit>(
    `
    select MMrOW,growid,t1.GasId,t1.gasName,t1.gasType,t1.Dimension,work8,work7,work6,work5,work2 
                ,GasValue,MeasuredFrom,MeasuredDuty,MeasuredOn,Horizont 
                    from (select growid,GasId,gasName,gasType,Dimension , 
                                max(case when WorkTime=8 then refValue END ) as work8, 
                                max(case when WorkTime=7 then refValue END) as work7, 
                                max(case when WorkTime=6 then refValue END) as work6, 
                                max(case when WorkTime=5 then refValue END) as work5, 
                                max(case when WorkTime=2 then refValue END) as work2 
                                    from ( SELECT growid,GasId, WorkTime,gasType,gasName, Dimension , 
                                                        case when isnull(refValueMin) then concat('<',refValueMax) 
                                                            when isnull(refValueMax) then refValueMin else concat('от ',refValueMin,' до ',refValueMax) end AS refValue 
                                                    FROM ( SELECT xcom_references.id as growid, GasId, gasType, gasName,WorkTime,Dimension , refValueMin, refValueMax 
                                                                    FROM xcom_references INNER JOIN xcom_l_gases ON xcom_l_gases.id = xcom_references.GasID 
                                                            ) as g1 
                                            ) AS g2 GROUP by gasType order by growid,GasID) AS t1
                        inner JOIN (select xcom_man_measure.ID AS MMrOW,xcom_man_measure.GasID,gasName,gasType,GasValue,MeasuredFrom,MeasuredDuty,MeasuredOn,
                                                Horizont,xcom_man_measure.lrd,xcom_man_measure.lrdFrom,Dimension 
                                            from (xcom_man_measure inner join xcom_l_gases on xcom_man_measure.GasID=xcom_l_gases.ID) 
                                                    inner join xcom_references as xcRef on xcRef.GasID=xcom_l_gases.ID 
                                            where MeasuredOn = ?
                                                and Horizont = ?
                                    group by MeasuredOn,gasid,MeasuredFrom,Horizont) AS t2
                        on t1.GasId=t2.GasId
  `,
    [date, elevation],
  );
}

/**
 * Update gas measurements.
 */
export async function updateGasMeasurements(
  measurements: UpdateGasMeasurementInput[],
): Promise<void> {
  await mysqlTransaction(async (connection) => {
    for (const measurement of measurements) {
      await connection.execute(
        `
       Update xcom_man_measure set 
                    GasValue = ?,
                    MeasuredFrom = ?,
                    MeasuredDuty = ?,
                    MeasuredOn = ?,
                    Horizont = ?,
                    lrdFrom = ?
    where MeasuredOn = ? and GasID = ?
          `,
        [
          measurement.GasValue,
          measurement.MeasuredFrom,
          measurement.MeasuredDuty,
          measurement.MeasuredOn,
          measurement.Horizont,
          measurement.lrdFrom ?? "system",
          measurement.OldMeasuredOn,
          measurement.GasID,
        ],
      );
    }
  });
}

/**
 * Get gas references.
 */
export async function getGasReferences(): Promise<GasReference[]> {
  return mysqlQuery<GasReference>(`
     select growid,GasId,gasName,gasType,Dimension, 
                max(case when WorkTime=8 then refValue END) as work8, 
                max(case when WorkTime=7 then refValue END) as work7, 
                max(case when WorkTime=6 then refValue END) as work6, 
                max(case when WorkTime=5 then refValue END) as work5, 
                max(case when WorkTime=2 then refValue END) as work2 
            from (
                SELECT growid,GasId, WorkTime,gasType,gasName,Dimension, 
                    case when isnull(refValueMin) then concat('<',refValueMax) 
                        when isnull(refValueMax) then refValueMin 
                        else concat('от ',refValueMin,' до ',refValueMax) end AS refValue 
                FROM (
                    SELECT xcom_references.id as growid, GasId, gasType, gasName,
                        WorkTime, Dimension , refValueMin, refValueMax 
                    FROM xcom_references INNER JOIN xcom_l_gases ON xcom_l_gases.id = xcom_references.GasID 
                    ) as g1 
            ) AS g2 
            GROUP by gasType 
            order by growid,GasID
  `);
}

/**
 * Get sampler names.
 */
export async function getSamplerNames(): Promise<string[]> {
  const results = await mysqlQuery<{ name: string }>(`
    SELECT DISTINCT MeasuredFrom AS name
    FROM xcom_man_measure
    WHERE MeasuredFrom IS NOT NULL
    ORDER BY MeasuredFrom
  `);
  return results.map((r) => r.name);
}

/**
 * Get sampler duties.
 */
export async function getSamplerDuties(): Promise<string[]> {
  const results = await mysqlQuery<{ duty: string }>(`
    SELECT DISTINCT MeasuredDuty AS duty
    FROM xcom_man_measure
    WHERE MeasuredDuty IS NOT NULL
    ORDER BY MeasuredDuty
  `);
  return results.map((r) => r.duty);
}

/**
 * Get sampler details (names and duties).
 */
export async function getSamplerDetails(): Promise<SamplerDetails> {
  const names = await getSamplerNames();
  const duties = await getSamplerDuties();
  return { names, duties };
}

/**
 * Create gas measurements.
 */
export async function createGasMeasurements(
  measurements: CreateGasMeasurementInput[],
): Promise<void> {
  await mysqlTransaction(async (connection) => {
    for (const measurement of measurements) {
      await connection.execute(
        `
        INSERT INTO xcom_man_measure (
          GasID, GasValue, MeasuredFrom, MeasuredDuty, MeasuredOn, Horizont, lrdFrom
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          measurement.GasID,
          measurement.GasValue,
          measurement.MeasuredFrom,
          measurement.MeasuredDuty,
          measurement.MeasuredOn,
          measurement.Horizont,
          measurement.lrdFrom ?? "system",
        ],
      );
    }
  });
}
