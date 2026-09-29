import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { HindsightClient } from "@vectorize-io/hindsight-client";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Serve the Vite production frontend
app.use(express.static(path.join(process.cwd(), "dist")));

const PORT = process.env.PORT || 8787;
const BANK_ID = process.env.HINDSIGHT_BANK_ID || "handoffos-demo";

const BASE_URL =
  process.env.HINDSIGHT_BASE_URL ||
  "https://api.hindsight.vectorize.io";

const API_KEY = process.env.HINDSIGHT_API_KEY;

// ------------------------------------------------------------
// Hindsight client
// ------------------------------------------------------------

const hindsightOptions = {
  baseUrl: BASE_URL,
};

if (API_KEY) {
  hindsightOptions.apiKey = API_KEY;
}

const client = new HindsightClient(hindsightOptions);

// ------------------------------------------------------------
// Demo memories
// ------------------------------------------------------------

const seedMemories = [
  {
    id: "AUTH-1194",
    content:
      "Incident AUTH-1194 on 2025-06-18: the first legacy authentication migration introduced token validation regressions. The Platform Team rolled the migration back. Lesson: authentication cutovers require a verified rollback path.",
    context: "engineering incident",
    timestamp: "2025-06-18T09:00:00Z",
  },
  {
    id: "AUTH-1427",
    content:
      "Incident AUTH-1427 on 2025-11-08: the second legacy authentication migration caused intermittent enterprise login failures. Maya Chen identified that a legacy token bridge was required for rollback. Severity critical.",
    context: "engineering incident",
    timestamp: "2025-11-08T14:00:00Z",
  },
  {
    id: "DEC-LEGACY-AUTH",
    content:
      "Decision on 2025-11-12 by Maya Chen: keep the legacy authentication service temporarily. Reason: two migration failures had occurred and Enterprise Client ABC had not completed its migration. Do not decommission until ABC migration and rollback validation are verified.",
    context: "architecture decision",
    timestamp: "2025-11-12T10:00:00Z",
  },
  {
    id: "WORK-22",
    content:
      "Undocumented workaround discovered on 2025-11-13: keep the token bridge enabled during authentication cutovers so the team can roll back without breaking enterprise login sessions. Owner and source of the practice: Maya Chen.",
    context: "operational workaround",
    timestamp: "2025-11-13T10:00:00Z",
  },
  {
    id: "ABC-DEPENDENCY",
    content:
      "Dependency record on 2026-02-03: Enterprise Client ABC still depended on the legacy authentication service. The service could appear unused in application code while remaining active through the ABC enterprise integration. Maya Chen was the primary source of this context.",
    context: "enterprise dependency",
    timestamp: "2026-02-03T10:00:00Z",
  },
  {
    id: "MAYA-HANDOFF",
    content:
      "Handoff note: Maya Chen is leaving. Critical knowledge is concentrated around Legacy Auth, Identity Gateway, and ABC cutover verification. Successor must understand why the service was retained, the previous migration failures, the token bridge workaround, and the ABC dependency before changing the system.",
    context: "employee handoff",
    timestamp: "2026-09-20T10:00:00Z",
  },
];

// ------------------------------------------------------------
// Bank setup
// ------------------------------------------------------------

async function ensureBank() {
  try {
    await client.createBank(BANK_ID, {
      name: "HandoffOS Organizational Memory",
      background:
        "Organizational memory and engineering knowledge-safety bank. Preserve decisions, incidents, workarounds, dependencies, owners and outcomes over time.",
      disposition: {
        skepticism: 4,
        literalism: 4,
        empathy: 2,
      },
    });
  } catch (e) {
    // Bank may already exist.
  }

  return true;
}

// ------------------------------------------------------------
// Health
// ------------------------------------------------------------

app.get("/api/health", async (_req, res) => {
  try {
    await ensureBank();

    const result = await client.listMemories(BANK_ID, {
      limit: 1,
      offset: 0,
    });

    res.json({
      connected: true,
      provider: "Hindsight",
      bankId: BANK_ID,
      memories: result.total ?? result.items?.length ?? 0,
    });
  } catch (e) {
    res.status(502).json({
      connected: false,
      provider: "Hindsight",
      reason: e?.message || "Hindsight request failed",
    });
  }
});

// ------------------------------------------------------------
// Seed
// ------------------------------------------------------------

app.post("/api/seed", async (_req, res) => {
  try {
    await ensureBank();

    for (const item of seedMemories) {
      await client.retain(
        BANK_ID,
        item.content,
        {
          context: item.context,
          timestamp: new Date(item.timestamp),
          metadata: {
            sourceId: item.id,
            product: "HandoffOS",
          },
        }
      );
    }

    res.json({
      ok: true,
      retained: seedMemories.length,
      bankId: BANK_ID,
    });
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: e?.message || "Seed failed",
    });
  }
});

// ------------------------------------------------------------
// Recall
// ------------------------------------------------------------

app.post("/api/recall", async (req, res) => {
  const query = req.body?.query || "";

  try {
    const result = await client.recall(BANK_ID, query, {
      limit: 8,
      budget: "low",
    });

    res.json({
      connected: true,
      query,
      results: (result.results || []).map((x) => ({
        text: x.text,
        type: x.type,
        score: x.score,
        metadata: x.metadata,
      })),
      trace: "Hindsight recall → HandoffOS retrieved organizational memory",
    });
  } catch (e) {
    res.status(500).json({
      connected: false,
      error: e?.message || "Recall failed",
    });
  }
});

// ------------------------------------------------------------
// Local HandoffOS safety analysis
//
// We intentionally do NOT call Hindsight reflect here because
// the local llama3.2:3b environment is timing out on reflect.
// Hindsight recall remains the source of historical evidence.
// ------------------------------------------------------------

function analyzePreflight(action, memories) {
  const combined = memories
    .map((memory) => memory.text || "")
    .join(" ")
    .toLowerCase();

  const findings = [];

  if (
    combined.includes("migration") ||
    combined.includes("authentication")
  ) {
    findings.push(
      "Previous authentication migrations caused failures or regressions."
    );
  }

  if (
    combined.includes("abc") ||
    combined.includes("enterprise client")
  ) {
    findings.push(
      "Enterprise Client ABC has a documented dependency on the legacy authentication service."
    );
  }

  if (
    combined.includes("token bridge") ||
    combined.includes("rollback")
  ) {
    findings.push(
      "A token bridge / rollback workaround was previously required during authentication cutovers."
    );
  }

  if (combined.includes("maya")) {
    findings.push(
      "Important operational knowledge was associated with Maya's handoff."
    );
  }

  const safeCondition =
    "Verify that Enterprise Client ABC has completed migration and that the rollback path/token bridge is no longer required before decommissioning.";

  return {
    status: "blocked",
    risk: findings.length >= 2 ? "high" : "medium",
    findings,
    safeCondition,
  };
}

// ------------------------------------------------------------
// Pre-Flight
// ------------------------------------------------------------

app.post("/api/preflight", async (req, res) => {
  const action =
    req.body?.action ||
    "Delete the unused legacy authentication service";

  try {
    const query = `
Pre-flight safety check for this proposed engineering action:

${action}

Find historical incidents, decisions, workarounds, dependencies,
client constraints and previous failures relevant to this action.
`;

    // Genuine Hindsight memory retrieval.
    const recalled = await client.recall(BANK_ID, query, {
      limit: 8,
      budget: "low",
    });

    const memories = recalled.results || [];

    // HandoffOS analyzes the retrieved organizational evidence.
    const analysis = analyzePreflight(action, memories);

    res.json({
      connected: true,
      action,

      status: analysis.status,
      risk: analysis.risk,

      recalled: memories.map((x) => x.text),

      findings: analysis.findings,

      reflection:
        `HandoffOS reviewed ${memories.length} historical memories. ` +
        analysis.findings.join(" ") +
        ` Required condition: ${analysis.safeCondition}`,

      trace:
        "Hindsight recall → HandoffOS evidence analysis → safety decision",
    });
  } catch (e) {
    console.error("Pre-flight error:", e);

    res.status(500).json({
      connected: false,
      error: e?.message || "Pre-flight failed",
    });
  }
});

// ------------------------------------------------------------
// Evidence update
// ------------------------------------------------------------

app.post("/api/evidence", async (req, res) => {
  const evidence =
    req.body?.evidence ||
    "Enterprise Client ABC completed its migration yesterday.";

  try {
    // 1. RETAIN new evidence in Hindsight.
    await client.retain(
      BANK_ID,
      `New verification evidence received on ${new Date().toISOString()}: ${evidence}. This evidence may change the current safety state but must not delete historical incidents, decisions or dependencies.`,
      {
        context: "pre-flight new evidence",
        timestamp: new Date(),
        metadata: {
          source: "HandoffOS",
          kind: "verification",
        },
      }
    );

    // 2. RECALL historical + new evidence.
    const recalled = await client.recall(
      BANK_ID,
      `
Re-evaluate the legacy authentication decommissioning decision.

New evidence:
${evidence}

Find historical ABC dependencies, previous migration failures,
rollback requirements and any information relevant to whether
the current situation has changed.
`,
      {
        limit: 8,
        budget: "low",
      }
    );

    const memories = recalled.results || [];

    // 3. Determine current state while preserving historical memory.
    const evidenceLower = evidence.toLowerCase();

    const abcMigrated =
      evidenceLower.includes("abc") &&
      evidenceLower.includes("completed") &&
      evidenceLower.includes("migration");

    const currentStatus = abcMigrated ? "cleared" : "blocked";
    const currentRisk = abcMigrated ? "resolved" : "high";

    const currentExplanation = abcMigrated
      ? "New evidence indicates that Enterprise Client ABC completed its migration. Historical incidents and decisions remain preserved, but the documented ABC dependency condition has changed."
      : "The new evidence does not yet establish that the historical dependency has been removed.";

    res.json({
      connected: true,

      status: currentStatus,
      risk: currentRisk,

      evidence,

      recalled: memories.map((x) => x.text),

      reflection: currentExplanation,

      trace:
        "Hindsight retain → Hindsight recall → HandoffOS current-state update; history preserved",
    });
  } catch (e) {
    console.error("Evidence update error:", e);

    res.status(500).json({
      connected: false,
      error: e?.message || "Evidence update failed",
    });
  }
});

// ------------------------------------------------------------
// List memories
// ------------------------------------------------------------

app.get("/api/memories", async (_req, res) => {
  try {
    const result = await client.listMemories(BANK_ID, {
      limit: 100,
      offset: 0,
    });

    res.json({
      connected: true,
      items: result.items || [],
      total: result.total || 0,
    });
  } catch (e) {
    res.status(500).json({
      connected: false,
      error: e?.message || "Memory listing failed",
    });
  }
});

// ------------------------------------------------------------
// Serve React frontend
// ------------------------------------------------------------

app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(process.cwd(), "dist", "index.html"));
});

// ------------------------------------------------------------
// Start server
// ------------------------------------------------------------

app.listen(PORT, () => {
  console.log(
    `HandoffOS server running on http://localhost:${PORT}`
  );
});