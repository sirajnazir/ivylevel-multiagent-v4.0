import * as fs from 'fs';
import * as path from 'path';
import {
  jennyAssessmentStructuredSchema_v1,
  JennyAssessmentStructured_v1,
} from '../schema/jennyAssessmentStructured_v1';

/**
 * Data Loader for Jenny's Structured Student Assessments
 *
 * Provides functions to load and validate structured assessment files
 * from the jenny_assessments_v1 directory.
 */

// Root directory for Jenny assessment files (v4 organized structure)
// Find monorepo root by looking for package.json with workspaces
function findMonorepoRoot(): string {
  let currentDir = process.cwd();

  // If we're in apps/student-app, go up 2 levels to monorepo root
  if (currentDir.includes('/apps/student-app')) {
    return path.join(currentDir, '../..');
  }

  // Otherwise assume we're already at monorepo root
  return currentDir;
}

const JENNY_ASSESSMENTS_ROOT = path.join(
  findMonorepoRoot(),
  'data',
  'v4_organized',
  'students',
  'jenny_assessments_v1'
);

/**
 * List all Jenny assessment files in the directory
 * @returns Array of absolute file paths
 */
export async function listJennyAssessmentFiles(): Promise<string[]> {
  try {
    const files = await fs.promises.readdir(JENNY_ASSESSMENTS_ROOT);
    const jsonFiles = files
      .filter((file) => file.endsWith('.json'))
      .map((file) => path.join(JENNY_ASSESSMENTS_ROOT, file));
    return jsonFiles;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(
        `Jenny assessments directory not found: ${JENNY_ASSESSMENTS_ROOT}\n` +
          `Please ensure the directory exists and contains assessment files.`
      );
    }
    throw new Error(
      `Failed to list Jenny assessment files: ${(error as Error).message}`
    );
  }
}

/**
 * Load a Jenny assessment by student ID
 * @param id Student ID (e.g., "beya_bareeha_011" or just "011")
 * @returns Validated JennyAssessmentStructured_v1 object
 */
export async function loadJennyAssessmentById(
  id: string
): Promise<JennyAssessmentStructured_v1> {
  try {
    // List all files and find matching student ID
    const files = await listJennyAssessmentFiles();

    // Try to find a file that contains the student ID
    const matchingFile = files.find((filePath) => {
      const fileName = path.basename(filePath, '.json');
      return fileName.includes(id) || fileName.endsWith(`_${id}_structured`);
    });

    if (!matchingFile) {
      throw new Error(
        `No Jenny assessment file found for student ID: ${id}\n` +
          `Available files: ${files.map((f) => path.basename(f)).join(', ')}`
      );
    }

    // Read and parse the file
    const fileContent = await fs.promises.readFile(matchingFile, 'utf-8');
    const parsedData = JSON.parse(fileContent);

    // Validate using Zod schema
    const validatedData = jennyAssessmentStructuredSchema_v1.parse(parsedData);

    return validatedData;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `Invalid JSON in Jenny assessment file for ID ${id}: ${error.message}`
      );
    }
    if (error instanceof Error && error.name === 'ZodError') {
      throw new Error(
        `Jenny assessment validation failed for ID ${id}:\n${error.message}`
      );
    }
    throw error;
  }
}

/**
 * Load all Jenny assessments from the directory
 * @returns Array of validated JennyAssessmentStructured_v1 objects
 */
export async function loadAllJennyAssessments(): Promise<
  JennyAssessmentStructured_v1[]
> {
  try {
    const files = await listJennyAssessmentFiles();
    const assessments: JennyAssessmentStructured_v1[] = [];
    const errors: Array<{ file: string; error: string }> = [];

    for (const filePath of files) {
      try {
        const fileContent = await fs.promises.readFile(filePath, 'utf-8');
        const parsedData = JSON.parse(fileContent);
        const validatedData = jennyAssessmentStructuredSchema_v1.parse(parsedData);
        assessments.push(validatedData);
      } catch (error) {
        errors.push({
          file: path.basename(filePath),
          error: (error as Error).message,
        });
      }
    }

    // If any files failed to load, include that info in the error
    if (errors.length > 0) {
      console.warn(
        `Warning: ${errors.length} file(s) failed to load:`,
        errors.map((e) => `  - ${e.file}: ${e.error}`).join('\n')
      );
    }

    if (assessments.length === 0) {
      throw new Error(
        `No valid Jenny assessments found in ${JENNY_ASSESSMENTS_ROOT}`
      );
    }

    return assessments;
  } catch (error) {
    throw new Error(
      `Failed to load all Jenny assessments: ${(error as Error).message}`
    );
  }
}

/**
 * Type guard to check if an object is a valid JennyAssessmentStructured_v1
 * @param obj Object to check
 * @returns true if the object is a valid JennyAssessmentStructured_v1
 */
export function isJennyAssessmentStructured(
  obj: unknown
): obj is JennyAssessmentStructured_v1 {
  try {
    jennyAssessmentStructuredSchema_v1.parse(obj);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get student IDs from all available assessments
 * @returns Array of student IDs
 */
export async function listJennyStudentIds(): Promise<string[]> {
  const assessments = await loadAllJennyAssessments();
  return assessments.map((assessment) => assessment.student_id);
}
