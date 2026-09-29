# HandoffOS

Hackathon-ready demo MVP for Microsoft AI hackathons.

## Run locally
1. Install Node.js 18+.
2. In this folder run:
   npm install
   npm run dev
3. Open the local URL Vite prints.

## Demo script
1. Overview → show Maya departure alert.
2. Pre-Flight Check → show STOP state for deleting Legacy Auth.
3. Click Verify evidence → show historical state preserved and current state CLEARED.
4. Ghost Knowledge → show Maya's 84% concentration and undocumented workarounds.
5. Decision Genealogy → show why the decision existed.
6. Handoff Rehearsal → answer all four questions correctly for a verified handoff.
7. Knowledge Graph → finish with the relationship map.

## Microsoft architecture
The app is intentionally demo-mode and uses seeded data, so it works without credentials. The Architecture panel shows the intended Microsoft production stack: Microsoft Graph, Azure OpenAI, Azure AI Search, Cosmos DB, Teams/SharePoint and GitHub.


## Submission checklist from the challenge guide

- [x] Real business problem
- [x] Hindsight is the required persistent memory layer
- [x] Retain + recall + reflect are visible in the core workflow
- [x] Memory changes agent behavior
- [x] Before/after learning curve
- [x] Realistic synthetic engineering data
- [x] Focused workflow: one persona, one clear safety value proposition
- [x] GitHub-ready documented project
- [ ] Publish the repository
- [ ] Record and publish the 2–5 minute demo video
- [ ] Publish the technical article publicly
- [ ] Publish the social post
- [ ] Add the public project GitHub URL to the social post
- [ ] Add the Hindsight GitHub URL as the social-post comment

Content drafts are included in `article.md`, `linkedin-post.md`, and `video-script.md`.
