import * as xlsx from "xlsx";

export interface SheetStructure {
  sheetName: string;
  sourceFile: string;
  columns: {
    name: string;
    type: string;
  }[];
}

/**
 * Parses an Excel file and extracts the sheet names and the first two rows 
 * (headers and types typically).
 * @param file The Excel file to parse
 * @returns A promise that resolves to an array of SheetStructure
 */
export async function parseExcelStructure(file: File): Promise<SheetStructure[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("Failed to read file data");

        // Parse the workbook
        const workbook = xlsx.read(data, { type: "array" });
        const structures: SheetStructure[] = [];

        // Iterate over each sheet
        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];

          // Convert sheet to JSON, getting arrays of rows
          // We only need the first few rows to extract structure (header=1 means array of arrays)
          const rows = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" });

          if (rows.length >= 2) {
            // First row is English keys/type, second row is Chinese description
            const typeRow = rows[0] || [];
            const headerRow = rows[1] || [];

            const columns = [];

            for (let i = 0; i < Math.max(headerRow.length, typeRow.length); i++) {
              const type = String(typeRow[i] || "").trim();
              const name = String(headerRow[i] || "").trim();

              if (name || type) {
                columns.push({ name: name || "Unknown", type: type || "Unknown" });
              }
            }

            structures.push({
              sheetName,
              sourceFile: file.name,
              columns
            });
          } else if (rows.length === 1) {
            // Only one row exists
            const headerRow = rows[0] || [];
            const columns = headerRow.map(h => ({ name: String(h).trim(), type: "Unknown" }));
            structures.push({ sheetName, sourceFile: file.name, columns });
          } else {
            // Empty sheet
            structures.push({ sheetName, sourceFile: file.name, columns: [] });
          }
        }

        resolve(structures);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
