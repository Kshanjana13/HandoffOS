# HandoffOS — 3-minute demo script

## 0:00–0:30 — Problem

ON SCREEN: HandoffOS Overview.

Say:

“When a senior engineer leaves, the company usually keeps the code, tickets and documents. What gets lost is the reasoning: why a decision was made, which workaround was required, and which hidden dependency was still active.

HandoffOS turns that history into an active safety layer.”

Show the Maya departure alert.

## 0:30–0:55 — Introduce Hindsight

ON SCREEN: Sidebar showing “Hindsight connected”.

Say:

“HandoffOS uses Hindsight as its persistent organizational memory. I retain incidents, architecture decisions, dependencies and workarounds, then recall them when an engineer proposes a change.

This is not a static demo database. The application is calling Hindsight retain, recall and reflect operations.”

## 0:55–1:45 — Pre-Flight

ON SCREEN: Pre-Flight Check.

Say:

“Arjun is new to the team. He proposes: delete the unused legacy authentication service.”

Click “Run Hindsight Pre-Flight”.

Show the recalled memories.

Say:

“Hindsight recalls two previous migration failures, the ABC enterprise dependency, and the decision to keep the service temporarily.

HandoffOS reflects over that memory and blocks the action.”

Pause on STOP.

“Notice that the warning is based on organizational history, not just the current code state.”

## 1:45–2:25 — Learning from new evidence

ON SCREEN: New Evidence.

Say:

“Now Arjun provides new evidence: ABC completed its migration yesterday.”

Click “Retain + verify evidence”.

Say:

“This is the important part. HandoffOS retains the new evidence in Hindsight, recalls it with the historical context, and reflects again.”

Show the state change:

“Unsafe becomes safe after verification.

But the old incidents are still preserved. The system changed its current conclusion without rewriting its history.”

## 2:25–2:50 — Handoff rehearsal

ON SCREEN: Handoff Rehearsal.

Say:

“Finally, the incoming engineer has to prove the knowledge transferred.

The questions test the reasoning behind the decision—not just whether the engineer read a document.”

Answer the four questions.

Show “Handoff verified”.

## 2:50–3:00 — Takeaway

ON SCREEN: HandoffOS dashboard.

Say:

“HandoffOS is built around one idea: organizational memory is valuable when it changes what a team does next.

It remembers what happened, checks what you're about to do, learns from new evidence, and tests whether the knowledge actually transferred.”
