import fs from "fs";
import path from "path";
import { extractEQPatterns } from "./llm/eqPatternExtractor";
import { extractFrameworks } from "./llm/frameworkExtractor";
import { extractTactics } from "./llm/tacticsExtractor";
import { extractTooling } from "./llm/toolingExtractor";
import { extractTemplatesAndScripts } from "./llm/templateScriptExtractor";
import { extractPersona } from "./llm/personaExtractor";
import { extractStrategies } from "./llm/strategyExtractor";
import { manifestSchema, type Manifest, type IngestionRun } from "./manifest.schema";
import { randomUUID } from "crypto";

/**
 * Main Coach Data Ingestion Runner
 *
 * Processes coach transcripts, iMessages, emails, and documents to extract:
 * - EQ patterns (emotional intelligence markers)
 * - Frameworks (strategic/tactical frameworks)
 * - Tactics (specific coaching techniques)
 * - Persona traits (Jenny's unique voice)
 *
 * All outputs are versioned and tracked in manifest.json
 */

const DATA_DIR = path.join(__dirname, "../../data/coach");
const CURATED_DIR = path.join(DATA_DIR, "curated");
const EQ_DIR = path.join(CURATED_DIR, "eq-patterns");
const FRAMEWORK_DIR = path.join(CURATED_DIR, "frameworks");
const TACTICS_DIR = path.join(CURATED_DIR, "tactics");
const TOOLING_DIR = path.join(CURATED_DIR, "tooling");
const TEMPLATE_SCRIPT_DIR = path.join(CURATED_DIR, "templates-scripts");
const PERSONA_DIR = path.join(CURATED_DIR, "persona");
const STRATEGY_DIR = path.join(CURATED_DIR, "strategies");
const MANIFEST_PATH = path.join(DATA_DIR, "manifest.json");

// Ensure directories exist
[DATA_DIR, CURATED_DIR, EQ_DIR, FRAMEWORK_DIR, TACTICS_DIR, TOOLING_DIR, TEMPLATE_SCRIPT_DIR, PERSONA_DIR, STRATEGY_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Load or initialize manifest
 */
function loadManifest(): Manifest {
  if (fs.existsSync(MANIFEST_PATH)) {
    const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
    return manifestSchema.parse(JSON.parse(raw));
  }

  return {
    version: "1.0",
    lastUpdated: new Date().toISOString(),
    ingestionRuns: [],
    totalSourceFiles: 0,
    totalEqPatterns: 0,
    totalFrameworks: 0,
    totalTactics: 0,
    totalTooling: 0,
    totalTemplateScripts: 0,
    totalPersonas: 0,
    totalStrategies: 0
  };
}

/**
 * Save manifest
 */
function saveManifest(manifest: Manifest): void {
  manifest.lastUpdated = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

/**
 * Ingest a single coach transcript/document
 */
export async function ingestCoachFile(filePath: string): Promise<IngestionRun> {
  const runId = randomUUID();
  const fileName = path.basename(filePath);

  console.log(`[IngestCoach] Starting ingestion: ${fileName} (run: ${runId})`);

  const run: IngestionRun = {
    runId,
    timestamp: new Date().toISOString(),
    sourceFiles: [filePath],
    curatedFiles: [],
    eqPatternFiles: [],
    frameworkFiles: [],
    tacticsFiles: [],
    toolingFiles: [],
    templateScriptFiles: [],
    status: "processing"
  };

  try {
    // Read source file
    const text = fs.readFileSync(filePath, "utf8");

    // Step 1: Extract EQ patterns
    console.log(`[IngestCoach] Extracting EQ patterns...`);
    const eqPatterns = await extractEQPatterns(text, fileName);

    // Save EQ patterns
    const eqPath = path.join(EQ_DIR, `${fileName}.eq.json`);
    fs.writeFileSync(eqPath, JSON.stringify(eqPatterns, null, 2));
    run.eqPatternFiles!.push(eqPath);

    console.log(`[IngestCoach] Extracted ${eqPatterns.length} EQ patterns → ${eqPath}`);

    // Step 2: Extract frameworks
    console.log(`[IngestCoach] Extracting frameworks...`);
    const frameworks = await extractFrameworks(text, fileName);

    // Save frameworks
    const fwPath = path.join(FRAMEWORK_DIR, `${fileName}.framework.json`);
    fs.writeFileSync(fwPath, JSON.stringify(frameworks, null, 2));
    run.frameworkFiles!.push(fwPath);

    console.log(`[IngestCoach] Extracted ${frameworks.length} frameworks → ${fwPath}`);

    // Step 3: Extract tactics
    console.log(`[IngestCoach] Extracting tactics...`);
    const tactics = await extractTactics(text, fileName);

    // Save tactics
    const tacPath = path.join(TACTICS_DIR, `${fileName}.tactics.json`);
    fs.writeFileSync(tacPath, JSON.stringify(tactics, null, 2));
    run.tacticsFiles!.push(tacPath);

    console.log(`[IngestCoach] Extracted ${tactics.length} tactics → ${tacPath}`);

    // Step 4: Extract tooling
    console.log(`[IngestCoach] Extracting tooling...`);
    const tooling = await extractTooling(text, fileName);

    // Save tooling
    const toolPath = path.join(TOOLING_DIR, `${fileName}.tools.json`);
    fs.writeFileSync(toolPath, JSON.stringify(tooling, null, 2));
    run.toolingFiles!.push(toolPath);

    console.log(`[IngestCoach] Extracted ${tooling.length} tooling items → ${toolPath}`);

    // Step 5: Extract templates and scripts
    console.log(`[IngestCoach] Extracting templates and scripts...`);
    const templateScript = await extractTemplatesAndScripts(text, fileName);

    // Save templates and scripts
    const tsPath = path.join(TEMPLATE_SCRIPT_DIR, `${fileName}.templates.json`);
    fs.writeFileSync(tsPath, JSON.stringify(templateScript, null, 2));
    run.templateScriptFiles!.push(tsPath);

    const totalItems = templateScript.templates.length + templateScript.scripts.length +
                       templateScript.scaffolds.length + templateScript.rubrics.length;
    console.log(`[IngestCoach] Extracted ${totalItems} template/script items → ${tsPath}`);

    // Step 6: Extract persona
    console.log(`[IngestCoach] Extracting persona...`);
    const persona = await extractPersona(text, fileName);

    // Save persona
    const personaPath = path.join(PERSONA_DIR, `${fileName}.persona.json`);
    fs.writeFileSync(personaPath, JSON.stringify(persona, null, 2));
    run.personaFiles!.push(personaPath);

    const totalPersonaItems = persona.personaTraits.length + persona.voiceCharacteristics.length +
                              persona.signaturePhrases.length + persona.eqMicroPatterns.length +
                              persona.studentAdaptationBehaviors.length;
    console.log(`[IngestCoach] Extracted ${totalPersonaItems} persona items → ${personaPath}`);

    // Step 7: Extract strategies
    console.log(`[IngestCoach] Extracting strategies...`);
    const strategies = await extractStrategies(text, fileName);

    // Save strategies
    const strategyPath = path.join(STRATEGY_DIR, `${fileName}.strategies.json`);
    fs.writeFileSync(strategyPath, JSON.stringify(strategies, null, 2));
    run.strategyFiles!.push(strategyPath);

    const totalStrategyItems = strategies.frameworks.length + strategies.tacticalSequences.length +
                               strategies.playbooks.length + strategies.decisionHeuristics.length +
                               strategies.studentTypeAdaptations.length;
    console.log(`[IngestCoach] Extracted ${totalStrategyItems} strategy items → ${strategyPath}`);

    run.status = "completed";
    console.log(`[IngestCoach] Ingestion completed: ${fileName}`);
  } catch (error) {
    run.status = "failed";
    run.errors = [(error as Error).message];
    console.error(`[IngestCoach] Ingestion failed: ${fileName}`, error);
  }

  return run;
}

/**
 * Ingest all files in a directory
 */
export async function ingestCoachDirectory(dirPath: string): Promise<void> {
  const manifest = loadManifest();

  const files = fs.readdirSync(dirPath).filter((f) => {
    return f.endsWith(".txt") || f.endsWith(".md") || f.endsWith(".json");
  });

  console.log(`[IngestCoach] Found ${files.length} files to process`);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const run = await ingestCoachFile(filePath);
    manifest.ingestionRuns.push(run);
  }

  // Update totals
  manifest.totalSourceFiles = files.length;
  manifest.totalEqPatterns = manifest.ingestionRuns.reduce(
    (sum, run) => sum + (run.eqPatternFiles?.length || 0),
    0
  );
  manifest.totalFrameworks = manifest.ingestionRuns.reduce(
    (sum, run) => sum + (run.frameworkFiles?.length || 0),
    0
  );
  manifest.totalTactics = manifest.ingestionRuns.reduce(
    (sum, run) => sum + (run.tacticsFiles?.length || 0),
    0
  );
  manifest.totalTooling = manifest.ingestionRuns.reduce(
    (sum, run) => sum + (run.toolingFiles?.length || 0),
    0
  );
  manifest.totalTemplateScripts = manifest.ingestionRuns.reduce(
    (sum, run) => sum + (run.templateScriptFiles?.length || 0),
    0
  );
  manifest.totalPersonas = manifest.ingestionRuns.reduce(
    (sum, run) => sum + (run.personaFiles?.length || 0),
    0
  );
  manifest.totalStrategies = manifest.ingestionRuns.reduce(
    (sum, run) => sum + (run.strategyFiles?.length || 0),
    0
  );

  saveManifest(manifest);
  console.log(`[IngestCoach] Manifest updated: ${MANIFEST_PATH}`);
}

/**
 * CLI entry point
 */
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: ts-node ingestCoach.ts <file-or-directory>");
    process.exit(1);
  }

  const target = args[0];
  const targetPath = path.resolve(target);

  if (!fs.existsSync(targetPath)) {
    console.error(`Error: Path does not exist: ${targetPath}`);
    process.exit(1);
  }

  const stats = fs.statSync(targetPath);

  if (stats.isDirectory()) {
    ingestCoachDirectory(targetPath)
      .then(() => console.log("✅ Ingestion complete"))
      .catch((err) => {
        console.error("❌ Ingestion failed:", err);
        process.exit(1);
      });
  } else {
    ingestCoachFile(targetPath)
      .then((run) => {
        const manifest = loadManifest();
        manifest.ingestionRuns.push(run);
        manifest.totalSourceFiles++;
        manifest.totalEqPatterns = manifest.ingestionRuns.reduce(
          (sum, r) => sum + (r.eqPatternFiles?.length || 0),
          0
        );
        manifest.totalFrameworks = manifest.ingestionRuns.reduce(
          (sum, r) => sum + (r.frameworkFiles?.length || 0),
          0
        );
        manifest.totalTactics = manifest.ingestionRuns.reduce(
          (sum, r) => sum + (r.tacticsFiles?.length || 0),
          0
        );
        manifest.totalTooling = manifest.ingestionRuns.reduce(
          (sum, r) => sum + (r.toolingFiles?.length || 0),
          0
        );
        manifest.totalTemplateScripts = manifest.ingestionRuns.reduce(
          (sum, r) => sum + (r.templateScriptFiles?.length || 0),
          0
        );
        manifest.totalPersonas = manifest.ingestionRuns.reduce(
          (sum, r) => sum + (r.personaFiles?.length || 0),
          0
        );
        manifest.totalStrategies = manifest.ingestionRuns.reduce(
          (sum, r) => sum + (r.strategyFiles?.length || 0),
          0
        );
        saveManifest(manifest);
        console.log("✅ Ingestion complete");
      })
      .catch((err) => {
        console.error("❌ Ingestion failed:", err);
        process.exit(1);
      });
  }
}
