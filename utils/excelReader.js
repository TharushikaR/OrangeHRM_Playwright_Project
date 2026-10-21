import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

export function readDataFromExcel(filePath, header, sheet = 0) {
  const fullPath = path.resolve(__dirname, "..", filePath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Excel file not found: ${fullPath}`);
  }

  const workbook = XLSX.readFile(fullPath);

  // sheet can be an index (0 = first, 1 = second) or a sheet name
  const sheetName =
    typeof sheet === "number" ? workbook.SheetNames[sheet] : sheet;

  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error(
      `Sheet "${sheet}" not found. Available sheets: ${workbook.SheetNames.join(", ")}`,
    );
  }

  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  return rows
    .map((row) => String(row[header] ?? "").trim())
    .filter((value) => value !== ""); // skip blank rows
}

module.exports = { readDataFromExcel };
