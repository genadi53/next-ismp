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
    SELECT m.GasID,
           g.gasName, g.gasType,
           ROUND(m.GasValue, 2) AS GasValue,
           m.MeasuredFrom,
           m.MeasuredDuty, m.MeasuredOn,
           m.Horizont, m.lrd,
           m.lrdFrom, g.Dimension
    FROM xcom_man_measure m
    INNER JOIN xcom_l_gases g ON m.GasID = g.ID
    INNER JOIN xcom_references AS xcRef ON xcRef.GasID = g.ID
    INNER JOIN (
      SELECT MeasuredOn, GasID, MeasuredFrom, Horizont, MAX(ID) AS MaxID
      FROM xcom_man_measure
      GROUP BY MeasuredOn, GasID, MeasuredFrom, Horizont
    ) AS latest ON m.ID = latest.MaxID
    ORDER BY m.MeasuredOn DESC
    LIMIT 0, 100
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
    SELECT MMrOW, growid, t1.GasId, t1.gasName, t1.gasType, t1.Dimension,
           work8, work7, work6, work5, work2,
           GasValue, MeasuredFrom, MeasuredDuty, MeasuredOn, Horizont
    FROM (
      SELECT growid, GasId, gasName, gasType, Dimension,
             MAX(CASE WHEN WorkTime = 8 THEN refValue END) AS work8,
             MAX(CASE WHEN WorkTime = 7 THEN refValue END) AS work7,
             MAX(CASE WHEN WorkTime = 6 THEN refValue END) AS work6,
             MAX(CASE WHEN WorkTime = 5 THEN refValue END) AS work5,
             MAX(CASE WHEN WorkTime = 2 THEN refValue END) AS work2
      FROM (
        SELECT growid, GasId, WorkTime, gasType, gasName, Dimension,
               CASE 
                 WHEN ISNULL(refValueMin) THEN CONCAT('<', refValueMax)
                 WHEN ISNULL(refValueMax) THEN refValueMin
                 ELSE CONCAT('от ', refValueMin, ' до ', refValueMax)
               END AS refValue
        FROM (
          SELECT xcom_references.id AS growid, GasId, gasType, gasName,
                 WorkTime, Dimension, refValueMin, refValueMax
          FROM xcom_references
          INNER JOIN xcom_l_gases ON xcom_l_gases.id = xcom_references.GasID
        ) AS g1
      ) AS g2
      GROUP BY gasType
      ORDER BY growid, GasID
    ) AS t1
    INNER JOIN (
      SELECT m.ID AS MMrOW, m.GasID, g.gasName, g.gasType,
             m.GasValue, m.MeasuredFrom, m.MeasuredDuty, m.MeasuredOn, m.Horizont,
             m.lrd, m.lrdFrom, g.Dimension
      FROM xcom_man_measure m
      INNER JOIN xcom_l_gases g ON m.GasID = g.ID
      INNER JOIN xcom_references AS xcRef ON xcRef.GasID = g.ID
      INNER JOIN (
        SELECT MeasuredOn, GasID, MeasuredFrom, Horizont, MAX(ID) AS MaxID
        FROM xcom_man_measure
        WHERE MeasuredOn = ? AND Horizont = ?
        GROUP BY MeasuredOn, GasID, MeasuredFrom, Horizont
      ) AS latest ON m.ID = latest.MaxID
    ) AS t2 ON t1.GasId = t2.GasID
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
        UPDATE xcom_man_measure 
        SET GasValue = ?,
            MeasuredFrom = ?,
            MeasuredDuty = ?,
            MeasuredOn = ?,
            Horizont = ?,
            lrdFrom = ?
        WHERE MeasuredOn = ? AND ID = ?
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
    SELECT growid, GasId, gasName, gasType, Dimension,
           MAX(CASE WHEN WorkTime = 8 THEN refValue END) AS work8,
           MAX(CASE WHEN WorkTime = 7 THEN refValue END) AS work7,
           MAX(CASE WHEN WorkTime = 6 THEN refValue END) AS work6,
           MAX(CASE WHEN WorkTime = 5 THEN refValue END) AS work5,
           MAX(CASE WHEN WorkTime = 2 THEN refValue END) AS work2
    FROM (
      SELECT growid, GasId, WorkTime, gasType, gasName, Dimension,
             CASE 
               WHEN ISNULL(refValueMin) THEN CONCAT('<', refValueMax)
               WHEN ISNULL(refValueMax) THEN refValueMin
               ELSE CONCAT('от ', refValueMin, ' до ', refValueMax)
             END AS refValue
      FROM (
        SELECT xcom_references.id AS growid, GasId, gasType, gasName,
               WorkTime, Dimension, refValueMin, refValueMax
        FROM xcom_references
        INNER JOIN xcom_l_gases ON xcom_l_gases.id = xcom_references.GasID
      ) AS g1
    ) AS g2
    GROUP BY gasType
    ORDER BY growid, GasID
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
