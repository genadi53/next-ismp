import type { GeowlanAP } from "@/server/repositories/geowlan";
import { convertLocalCoordToGlobal } from "./geowlanCoordinatesConverter";

/**
 * Exports geowlan access points to a KML file format compatible with Google Earth
 * @param geowlanPoints - Array of GeowlanAP objects to export
 * @param filename - Optional filename for the export (default: "geowlan_points.kml")
 * @returns Promise that resolves when the file is downloaded
 */
export const exportGeowlanToKML = async (
  geowlanPoints: GeowlanAP[],
  filename: string = "geowlan_points.kml",
): Promise<void> => {
  if (!geowlanPoints.length) {
    throw new Error("No geowlan points to export");
  }

  const kmlContent = generateKMLContent(geowlanPoints);
  downloadKMLFile(kmlContent, filename);
};

/**
 * Generates KML content from geowlan points
 * @param geowlanPoints - Array of GeowlanAP objects
 * @returns KML content as string
 */
const generateKMLContent = (geowlanPoints: GeowlanAP[]): string => {
  const placemarks = geowlanPoints
    .map((point) => {
      if (!point.x || !point.y) return "";
      const globalCoords = convertLocalCoordToGlobal(point.x, point.y);

      return `    <Placemark>
      <name>${escapeXML(point.name)}</name>
      <description><![CDATA[
        <b>Geowlan Access Point</b><br/>
        ID: ${point.id}<br/>
        Local Coordinates: X=${point.x}, Y=${point.y}<br/>
        Global Coordinates: Lat=${globalCoords.lat.toFixed(6)}, Lng=${globalCoords.lng.toFixed(6)}<br/>
        Status: ${point.enabled ? "Enabled" : "Disabled"}
      ]]></description>
      <Point>
        <coordinates>${globalCoords.lng.toFixed(6)},${globalCoords.lat.toFixed(6)},0</coordinates>
      </Point>
      <Style>
        <IconStyle>
          <color>${point.enabled ? "ff00ff00" : "ff0000ff"}</color>
          <scale>1.2</scale>
          <Icon>
            <href>http://maps.google.com/mapfiles/kml/pushpin/wht-pushpin.png</href>
          </Icon>
        </IconStyle>
        <LabelStyle>
          <color>ffffffff</color>
          <scale>0.8</scale>
        </LabelStyle>
      </Style>
    </Placemark>`;
    })
    .filter(Boolean)
    .join("\n");

  const currentDate = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Geowlan Access Points</name>
    <description><![CDATA[
      Geowlan access points exported from ISMP Portal<br/>
      Export Date: ${currentDate}<br/>
      Total Points: ${geowlanPoints.length}
    ]]></description>
    
    <!-- Style for enabled points -->
    <Style id="enabledPoint">
      <IconStyle>
        <color>ff00ff00</color>
        <scale>1.2</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/grn-pushpin.png</href>
        </Icon>
      </IconStyle>
      <LabelStyle>
        <color>ffffffff</color>
        <scale>0.8</scale>
      </LabelStyle>
    </Style>
    
    <!-- Style for disabled points -->
    <Style id="disabledPoint">
      <IconStyle>
        <color>ff0000ff</color>
        <scale>1.2</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png</href>
        </Icon>
      </IconStyle>
      <LabelStyle>
        <color>ffffffff</color>
        <scale>0.8</scale>
      </LabelStyle>
    </Style>
    
    <!-- Folder for all access points -->
    <Folder>
      <name>Access Points</name>
      <description>All Geowlan Access Points</description>
      
${placemarks}
    </Folder>
  </Document>
</kml>`;
};

/**
 * Escapes special XML characters in strings
 * @param text - Text to escape
 * @returns Escaped text safe for XML
 */
const escapeXML = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

/**
 * Downloads KML content as a file
 * @param content - KML content string
 * @param filename - Filename for the download
 */
const downloadKMLFile = (content: string, filename: string): void => {
  const blob = new Blob([content], {
    type: "application/vnd.google-earth.kml+xml",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
};

/**
 * Validates geowlan points before export
 * @param geowlanPoints - Array of GeowlanAP objects to validate
 * @returns Object with validation result and any error messages
 */
export const validateGeowlanPointsForExport = (
  geowlanPoints: GeowlanAP[],
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!Array.isArray(geowlanPoints)) {
    errors.push("Geowlan points must be an array");
    return { isValid: false, errors };
  }

  if (geowlanPoints.length === 0) {
    errors.push("No geowlan points to export");
    return { isValid: false, errors };
  }

  // Validate each point
  geowlanPoints.forEach((point, index) => {
    if (!point.id) {
      errors.push(`Point at index ${index} is missing an ID`);
    }
    if (!point.name || point.name.trim() === "") {
      errors.push(`Point at index ${index} is missing a name`);
    }
    if (typeof point.x !== "number" || isNaN(point.x)) {
      errors.push(`Point at index ${index} has invalid X coordinate`);
    }
    if (typeof point.y !== "number" || isNaN(point.y)) {
      errors.push(`Point at index ${index} has invalid Y coordinate`);
    }
  });

  return { isValid: errors.length === 0, errors };
};

