/**
 * File Scanner v1.0
 *
 * Recursively scans directories for supported file types.
 */

import fs from "fs";
import path from "path";
import { FileTask } from "./batch.types";

/**
 * Scan Files
 *
 * Recursively scans a directory for files matching the specified types.
 *
 * @param rootDir - Root directory to scan
 * @param types - File extensions to include (e.g., ["pdf", "txt"])
 * @returns Array of file tasks
 */
export function scanFiles(rootDir: string, types: string[]): FileTask[] {
  console.log(`[FileScanner] Scanning directory: ${rootDir}`);
  console.log(`[FileScanner] Looking for file types: ${types.join(", ")}`);

  const tasks: FileTask[] = [];

  /**
   * Walk Directory
   *
   * Recursively walks directory tree.
   */
  function walk(dir: string) {
    // Check if directory exists
    if (!fs.existsSync(dir)) {
      console.warn(`[FileScanner] Directory not found: ${dir}`);
      return;
    }

    const entries = fs.readdirSync(dir);

    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Recurse into subdirectories
        walk(fullPath);
      } else {
        // Check file extension
        const ext = path.extname(entry).substring(1).toLowerCase();

        if (types.includes(ext)) {
          tasks.push({
            path: fullPath,
            type: ext,
            size: stat.size
          });
        }
      }
    }
  }

  walk(rootDir);

  console.log(`[FileScanner] Found ${tasks.length} files to process`);

  return tasks;
}

/**
 * Get File Statistics
 *
 * Returns statistics about scanned files.
 */
export function getFileStats(tasks: FileTask[]) {
  const byType: Record<string, number> = {};
  let totalSize = 0;

  for (const task of tasks) {
    byType[task.type] = (byType[task.type] || 0) + 1;
    totalSize += task.size;
  }

  return {
    totalFiles: tasks.length,
    totalSize,
    byType
  };
}
