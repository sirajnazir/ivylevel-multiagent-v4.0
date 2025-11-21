/**
 * Batch UI v1.0
 *
 * Beautiful TUI (Terminal UI) for batch ingestion progress.
 * Uses ora for spinners, chalk for colors, cli-progress for bars.
 */

import ora, { Ora } from "ora";
import chalk from "chalk";
import { SingleBar, Presets } from "cli-progress";

/**
 * Batch UI
 *
 * Interface for the batch ingestion UI.
 */
export interface BatchUI {
  spinner: Ora;
  bar: SingleBar;
  update: (message?: string) => void;
  succeed: (message?: string) => void;
  fail: (message: string) => void;
  stop: () => void;
}

/**
 * Start Batch UI
 *
 * Initializes the gorgeous terminal UI for batch ingestion.
 *
 * Features:
 * - Spinning progress indicator
 * - Color-coded progress bar
 * - File count tracking
 * - Success/fail status
 *
 * @param total - Total number of files to process
 * @returns Batch UI controller
 */
export function startBatchUI(total: number): BatchUI {
  console.log(chalk.cyan.bold("\n🚀 Starting Batch Ingestion\n"));

  // Create spinner for overall progress
  const spinner = ora({
    text: "Initializing ingestion pipeline...",
    color: "cyan"
  }).start();

  // Create progress bar
  const bar = new SingleBar(
    {
      format: `${chalk.cyan("{bar}")} | {percentage}% | {value}/{total} files | {status}`,
      barCompleteChar: "█",
      barIncompleteChar: "░",
      hideCursor: true
    },
    Presets.shades_classic
  );

  bar.start(total, 0, { status: "Starting..." });

  let currentValue = 0;

  return {
    spinner,
    bar,

    /**
     * Update Progress
     *
     * Increments progress bar and updates status message.
     */
    update: (message?: string) => {
      currentValue++;
      bar.update(currentValue, {
        status: message || "Processing..."
      });
    },

    /**
     * Complete with Success
     *
     * Stops UI and shows success message.
     */
    succeed: (message?: string) => {
      bar.stop();
      spinner.succeed(chalk.green.bold(message || "✓ Ingestion complete!"));
      console.log("");
    },

    /**
     * Complete with Failure
     *
     * Stops UI and shows failure message.
     */
    fail: (message: string) => {
      bar.stop();
      spinner.fail(chalk.red.bold(`✗ ${message}`));
      console.log("");
    },

    /**
     * Stop UI
     *
     * Stops all UI elements.
     */
    stop: () => {
      bar.stop();
      spinner.stop();
    }
  };
}

/**
 * Print Summary Banner
 *
 * Prints a beautiful summary of the ingestion results.
 *
 * @param succeeded - Number of files that succeeded
 * @param failed - Number of files that failed
 * @param warnings - Number of warnings
 */
export function printSummaryBanner(
  succeeded: number,
  failed: number,
  warnings: number
) {
  console.log(chalk.cyan("─".repeat(60)));
  console.log(chalk.cyan.bold("  INGESTION SUMMARY"));
  console.log(chalk.cyan("─".repeat(60)));
  console.log("");

  if (succeeded > 0) {
    console.log(chalk.green(`  ✓ Succeeded:  ${succeeded} files`));
  }

  if (failed > 0) {
    console.log(chalk.red(`  ✗ Failed:     ${failed} files`));
  }

  if (warnings > 0) {
    console.log(chalk.yellow(`  ⚠ Warnings:   ${warnings} total`));
  }

  console.log("");
  console.log(chalk.cyan("─".repeat(60)));
  console.log("");
}

/**
 * Print File Result
 *
 * Prints a single file's result with color coding.
 *
 * @param filename - File name
 * @param status - Status ("success" | "failed" | "skipped")
 * @param message - Optional status message
 */
export function printFileResult(
  filename: string,
  status: "success" | "failed" | "skipped",
  message?: string
) {
  const icon =
    status === "success" ? chalk.green("✓") : status === "failed" ? chalk.red("✗") : chalk.yellow("⊘");

  const statusText =
    status === "success"
      ? chalk.green("PASS")
      : status === "failed"
      ? chalk.red("FAIL")
      : chalk.yellow("SKIP");

  console.log(`${icon} ${statusText} ${chalk.dim(filename)}`);

  if (message) {
    console.log(`  ${chalk.dim(message)}`);
  }
}
