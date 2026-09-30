import React, {useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {
  Activity, AlertTriangle, ArrowRight, Brain, CheckCircle2, ChevronRight,
  CircleHelp, Clock3, Database, GitBranch, GraduationCap, History,
  LayoutDashboard, Link2, Network, Search, ShieldCheck, Sparkles, Users,
  X, Zap
} from "lucide-react";
import "./styles.css";

const memories = [
  {
    type:"Incident",
    title:"AUTH-1427 · Login failures after migration",
    date:"2025-11-08",
    owner:"Maya Chen",
    system:"Legacy Auth",
    severity:"Critical",
    text:"The second authentication migration caused intermittent enterprise login failures. Rollback required a legacy token bridge."
  },
  {
    type:"Decision",
    title:"Keep legacy authentication service temporarily",
    date:"2025-11-12",
    owner:"Maya Chen",
    system:"Legacy Auth",
    severity:"High",
    text:"Decision was made to retain the service until Enterprise Client ABC completed its migration and rollback validation."
  },
  {
    type:"Workaround",
    title:"Token bridge must stay enabled during cutover",
    date:"2025-11-13",
    owner:"Maya Chen",
    system:"Identity Gateway",
    severity:"High",
    text:"Undocumented operational workaround used during authentication cutovers."
  },
  {
    type:"Dependency",
    title:"Enterprise Client ABC → Legacy Auth",
    date:"2026-02-03",
    owner:"Maya Chen",
    system:"ABC integration",
    severity:"Critical",
    text:"ABC still depended on the legacy service until its verified migration."
  },
  {
    type:"Incident",
    title:"AUTH-1194 · First migration rollback",
    date:"2025-06-18",
    owner:"Platform Team",
    system:"Legacy Auth",
    severity:"Critical",
    text:"A migration introduced token validation regressions and was rolled back."
  },
  {
    type:"Lesson",
    title:"Verify client migration before decommissioning auth",
    date:"2025-11-14",
    owner:"Maya Chen",
    system:"Legacy Auth",
    severity:"Medium",
    text:"A service can look unused in code while remaining active through enterprise integrations."
  }
];

const questions = [
  {
    q:"Why was the legacy authentication service kept?",
    opts:[
      "It was cheaper",
      "ABC had not completed its migration and rollback risk remained",
      "Maya preferred it",
      "The service had no replacement"
    ],
    a:1
  },
  {
    q:"What happened in the previous migration attempts?",
    opts:[
      "Nothing",
      "Two attempts caused login failures / rollback events",
      "Only a documentation issue",
      "A database outage"
    ],
    a:1
  },
  {
    q:"What dependency had to be verified?",
    opts:[
      "A billing job",
      "Enterprise Client ABC",
      "The analytics dashboard",
      "Maya's laptop"
    ],
    a:1
  },
  {
    q:"What new evidence changes the risk state?",
    opts:[
      "Arjun says it is safe",
      "A code comment",
      "ABC's completed migration is verified",
      "The service has low traffic"
    ],
    a:2
  }
];

function Badge({children, tone="slate"}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function Card({children, className=""}) {
  return <div className={`card ${className}`}>{children}</div>;
}

/* HandoffOS backend */
const API = "";
async function api(path, options={}) {
  const r = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type":"application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await r.json().catch(() => ({}));

  if(!r.ok) {
    throw new Error(data.error || `Request failed (${r.status})`);
  }

  return data;
}

function HindsightStatus({onSeed}) {
  const [state,setState] = useState({
    loading:true,
    connected:false
  });

  const [seeding,setSeeding] = useState(false);

  React.useEffect(() => {
    api("/api/health")
      .then(data => {
        setState({
          ...data,
          loading:false
        });
      })
      .catch(e => {
        setState({
          connected:false,
          reason:e.message,
          loading:false
        });
      });
  }, []);

  async function seed() {
    setSeeding(true);

    try {
      await api("/api/seed", {
        method:"POST"
      });

      const s = await api("/api/health");

      setState({
        ...s,
        loading:false
      });

      onSeed?.();
    } catch(e) {
      setState({
        connected:false,
        reason:e.message,
        loading:false
      });
    } finally {
      setSeeding(false);
    }
  }

  if(state.loading) {
    return (
      <div className="hstatus">
        <span className="hdot"></span>
        <div>
          <b>Checking Hindsight…</b>
          <small>Connecting to local memory service</small>
        </div>
      </div>
    );
  }

  return (
    <div className={`hstatus ${state.connected ? "connected" : ""}`}>
      <span className="hdot"></span>

      <div>
        <b>
          {state.connected
            ? "Hindsight connected"
            : "Hindsight not connected"}
        </b>

        <small>
          {state.connected
            ? `${state.memories || 0} memories in ${state.bankId || "handoffos-demo"}`
            : state.reason || "Check the HandoffOS backend on port 8787"}
        </small>
      </div>

      {!state.connected && (
        <button onClick={seed} disabled={seeding}>
          {seeding ? "Connecting…" : "Seed Hindsight"}
        </button>
      )}
    </div>
  );
}

function App(){
  const [page,setPage] = useState("overview");
  const [evidence,setEvidence] = useState(false);
  const [query,setQuery] = useState("");
  const [rehearsal,setRehearsal] = useState(false);
  const [answers,setAnswers] = useState({});
  const [showArch,setShowArch] = useState(false);

  const filtered = useMemo(
    () =>
      memories.filter(m =>
        (m.title+" "+m.text+" "+m.owner+" "+m.system)
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [query]
  );

  const score = Object.keys(answers).reduce(
    (s,i) => s + (answers[i] === questions[i].a ? 1 : 0),
    0
  );

  const nav = [
    ["overview","Overview",LayoutDashboard],
    ["memory","Memory",Brain],
    ["preflight","Pre-Flight Check",ShieldCheck],
    ["ghosts","Ghost Knowledge",Users],
    ["genealogy","Decision Genealogy",GitBranch],
    ["rehearsal","Handoff Rehearsal",GraduationCap],
    ["graph","Knowledge Graph",Network]
  ];

  return (
    <div className="app">

      <aside className="sidebar">

        <div className="brand">
          <div className="brandmark">
            <Sparkles size={19}/>
          </div>

          <div>
            <b>HandoffOS</b>
            <small>Organizational memory</small>
          </div>
        </div>

        <div className="demo">
          <span className="pulse"></span>
          Demo Mode
        </div>

        <HindsightStatus />

        <nav>
          {nav.map(([id,label,Icon]) => (
            <button
              key={id}
              className={page===id ? "active" : ""}
              onClick={() => setPage(id)}
            >
              <Icon size={18}/>
              <span>{label}</span>

              {id==="preflight" && (
                <Badge tone="red">!</Badge>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebarBottom">

          <button
            className="architecture"
            onClick={() => setShowArch(true)}
          >
            <Database size={17}/>
            Architecture
          </button>

          <div className="ms">
            <span className="msmark">⊞</span>
            <span>
              Microsoft AI
              <br/>
              <small>hackathon demo</small>
            </span>
          </div>

        </div>

      </aside>

      <main>

        <header className="topbar">

          <div>
            <div className="eyebrow">
              KNOWLEDGE SAFETY SYSTEM
            </div>

            <h1>
              {page==="overview"
                ? "Make sure knowledge doesn’t leave when people do"
                : nav.find(x=>x[0]===page)?.[1]}
            </h1>
          </div>

          <div className="top-actions">

            <button
              className="iconBtn"
              onClick={() => setPage("memory")}
            >
              <Search size={18}/>
            </button>

            <div className="avatar">
              AR
            </div>

          </div>

        </header>

        {page==="overview" && (
          <Overview setPage={setPage}/>
        )}

        {page==="memory" && (
          <Memory
            query={query}
            setQuery={setQuery}
            filtered={filtered}
          />
        )}

        {page==="preflight" && (
          <Preflight
            evidence={evidence}
            setEvidence={setEvidence}
            setPage={setPage}
          />
        )}

        {page==="ghosts" && (
          <Ghosts setPage={setPage}/>
        )}

        {page==="genealogy" && (
          <Genealogy/>
        )}

        {page==="rehearsal" && (
          <Rehearsal
            rehearsal={rehearsal}
            setRehearsal={setRehearsal}
            answers={answers}
            setAnswers={setAnswers}
            score={score}
          />
        )}

        {page==="graph" && (
          <Graph/>
        )}

      </main>

      {showArch && (
        <div
          className="modalBack"
          onClick={() => setShowArch(false)}
        >
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
          >

            <button
              className="close"
              onClick={() => setShowArch(false)}
            >
              <X/>
            </button>

            <Badge tone="cyan">
              PRODUCTION ARCHITECTURE
            </Badge>

            <h2>
              Built to plug into the Microsoft stack
            </h2>

            <p className="muted">
              This demo uses seeded data locally. The intended
              production architecture connects organizational
              signals to a temporal memory layer and an
              action-safety agent.
            </p>

            <div className="archgrid">

              {[
                ["Microsoft Graph","Teams, SharePoint, users & organizational context"],
                ["Azure OpenAI","Reasoning, extraction, evidence synthesis"],
                ["Azure AI Search","Hybrid + semantic retrieval over organizational memory"],
                ["Azure Cosmos DB","Relationships, events, temporal knowledge"],
                ["GitHub","Code, PRs, issues and engineering history"],
                ["Teams / SharePoint","Conversations, handoffs and source documents"]
              ].map(x => (
                <Card key={x[0]}>
                  <b>{x[0]}</b>
                  <p>{x[1]}</p>
                </Card>
              ))}

            </div>

            <div className="flow">
              <span>Signals</span>
              <ArrowRight/>
              <span>Memory</span>
              <ArrowRight/>
              <span>Risk engine</span>
              <ArrowRight/>
              <span>Human decision</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function Overview({setPage}){

  return (
    <div className="content">

      <section className="hero">

        <div>

          <Badge tone="cyan">
            KNOWLEDGE SAFETY
          </Badge>

          <h2>
            Remember what your organization learned —
            <br/>
            <span>before someone repeats the mistake.</span>
          </h2>

          <p>
            HandoffOS turns decisions, incidents, workarounds
            and dependencies into an active safety layer for teams.
          </p>

          <div className="heroBtns">

            <button
              className="primary"
              onClick={() => setPage("preflight")}
            >
              Run Pre-Flight Check
              <ArrowRight size={16}/>
            </button>

            <button
              className="secondary"
              onClick={() => setPage("ghosts")}
            >
              View knowledge gaps
            </button>

          </div>

        </div>

        <div className="heroOrb">

          <div className="orbRing r1"></div>
          <div className="orbRing r2"></div>

          <div className="orbCore">
            <Brain size={35}/>
            <small>
              MEMORY
              <br/>
              ONLINE
            </small>
          </div>

        </div>

      </section>

      <div className="alert">

        <div className="alertIcon">
          <AlertTriangle/>
        </div>

        <div>
          <b>
            Maya Chen is leaving — 3 critical knowledge dependencies detected.
          </b>

          <p>
            Legacy Auth, Identity Gateway, and ABC cutover
            knowledge have high concentration around one person.
          </p>
        </div>

        <button onClick={() => setPage("ghosts")}>
          Investigate
          <ChevronRight/>
        </button>

      </div>

      <div className="kpis">

        <Kpi
          icon={AlertTriangle}
          value="3"
          label="Critical dependencies"
          note="+2 since last review"
          tone="red"
        />

        <Kpi
          icon={GhostIcon}
          value="7"
          label="Ghost knowledge items"
          note="4 need an owner"
          tone="amber"
        />

        <Kpi
          icon={GitBranch}
          value="42"
          label="Decisions tracked"
          note="96% with evidence"
          tone="cyan"
        />

        <Kpi
          icon={ShieldCheck}
          value="91%"
          label="Handoff readiness"
          note="+14% this month"
          tone="green"
        />

      </div>

      <div className="two">

        <Card>

          <div className="cardHead">

            <div>
              <b>Knowledge concentration</b>
              <p>Where critical context lives today</p>
            </div>

            <Badge tone="red">
              3 at risk
            </Badge>

          </div>

          <div className="bars">

            {[
              ["Maya Chen","84%","critical"],
              ["Platform Team","58%","medium"],
              ["SRE","42%","low"],
              ["Product","21%","low"]
            ].map(x => (

              <div
                className="barrow"
                key={x[0]}
              >
                <span>{x[0]}</span>

                <div className="track">
                  <i
                    className={x[2]}
                    style={{width:x[1]}}
                  ></i>
                </div>

                <b>{x[1]}</b>
              </div>

            ))}

          </div>

        </Card>

        <Card>

          <div className="cardHead">

            <div>
              <b>Recent memory</b>
              <p>Latest organizational learning</p>
            </div>

            <button
              className="link"
              onClick={() => setPage("memory")}
            >
              View all
            </button>

          </div>

          {memories.slice(0,4).map(m => (

            <div
              className="activity"
              key={m.title}
            >

              <span
                className={`dot ${m.severity.toLowerCase()}`}
              ></span>

              <div>
                <b>{m.title}</b>
                <small>
                  {m.date} · {m.owner}
                </small>
              </div>

              <Badge
                tone={m.type==="Incident" ? "red" : "slate"}
              >
                {m.type}
              </Badge>

            </div>

          ))}

        </Card>

      </div>

    </div>
  );
}

function GhostIcon(p){
  return <Users {...p}/>;
}

function Kpi({icon:Icon,value,label,note,tone}){

  return (
    <Card className="kpi">

      <div className={`kpiIcon ${tone}`}>
        <Icon size={19}/>
      </div>

      <div>
        <strong>{value}</strong>
        <b>{label}</b>
        <small>{note}</small>
      </div>

    </Card>
  );
}

function Memory({query,setQuery,filtered}){

  const [live,setLive] = useState(null);
  const [loading,setLoading] = useState(false);

  async function recall(){

    setLoading(true);

    try {

      setLive(
        await api("/api/recall", {
          method:"POST",
          body:JSON.stringify({
            query:
              query ||
              "What do we remember about Legacy Auth and ABC?"
          })
        })
      );

    } catch(e) {

      setLive({
        error:e.message
      });

    } finally {

      setLoading(false);

    }
  }

  return (
    <div className="content">

      <div className="toolbar">

        <div className="search">

          <Search size={18}/>

          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search decisions, incidents, people, systems…"
          />

        </div>

        <button
          className="secondary"
          onClick={recall}
        >
          {loading
            ? "Recalling…"
            : "Recall from Hindsight"}

          <Brain size={15}/>
        </button>

      </div>

      {live && (

        <Card className="liveMemory">

          <div className="cardHead">

            <div>

              <Badge tone="cyan">
                LIVE HINDSIGHT RECALL
              </Badge>

              <p>{live.query}</p>

            </div>

            <span>
              {live.results?.length || 0} results
            </span>

          </div>

          {live.error ? (

            <p className="apiError">
              {live.error}
            </p>

          ) : (

            <div className="liveRecall">

              {(live.results || []).map((x,i) => (

                <div key={i}>
                  <Brain size={15}/>
                  <span>{x.text}</span>
                  <Badge tone="slate">
                    {x.type}
                  </Badge>
                </div>

              ))}

            </div>

          )}

        </Card>

      )}

      <div className="memoryGrid">

        {filtered.map(m => (

          <Card key={m.title}>

            <div className="memTop">

              <Badge
                tone={
                  m.severity==="Critical"
                    ? "red"
                    : m.severity==="High"
                      ? "amber"
                      : "slate"
                }
              >
                {m.type}
              </Badge>

              <span>{m.date}</span>

            </div>

            <h3>{m.title}</h3>
            <p>{m.text}</p>

            <div className="memFoot">

              <span>
                <Users size={14}/>
                {m.owner}
              </span>

              <span>
                <Database size={14}/>
                {m.system}
              </span>

            </div>

          </Card>

        ))}

      </div>

    </div>
  );
}

function Preflight({
  evidence,
  setEvidence,
  setPage
}){

  const [loading,setLoading] = useState(false);
  const [result,setResult] = useState(null);
  const [error,setError] = useState("");

  const action =
    "Delete the unused legacy authentication service";

  async function run(){

    setLoading(true);
    setError("");
    setEvidence(false);

    try {

      const r = await api("/api/preflight", {
        method:"POST",
        body:JSON.stringify({action})
      });

      setResult(r);

    } catch(e) {

      setError(e.message);

    } finally {

      setLoading(false);

    }
  }

  async function verify(){

    setLoading(true);
    setError("");

    try {

      const r = await api("/api/evidence", {
        method:"POST",
        body:JSON.stringify({
          evidence:
            "ABC completed its migration yesterday. Migration ticket ABC-8842 was verified."
        })
      });

      setResult(r);
      setEvidence(true);

    } catch(e) {

      setError(e.message);

    } finally {

      setLoading(false);

    }
  }

  return (
    <div className="content">

      <div className="preHero">

        <div>

          <Badge tone="red">
            HINDSIGHT MEMORY + ACTION SAFETY
          </Badge>

          <h2>
            Before you change the system,
            <br/>
            check what the organization already learned.
          </h2>

          <p>
            HandoffOS recalls historical incidents, decisions,
            workarounds and dependencies from Hindsight, then
            evaluates the recalled evidence before an action is cleared.
          </p>

        </div>

        <div className={`statusCircle ${evidence ? "safe" : ""}`}>

          {evidence
            ? <CheckCircle2 size={40}/>
            : <ShieldCheck size={40}/>}

          <small>
            {evidence ? "CLEARED" : "CHECK"}
          </small>

        </div>

      </div>

      <Card className="actionCard">

        <label>
          PROPOSED ACTION
        </label>

        <div className="actionInput">
          {action}
          <span>→</span>
        </div>

        <div className="checkRow">

          <button
            className="primary"
            onClick={run}
            disabled={loading}
          >
            {loading
              ? "Recalling memory…"
              : "Run Hindsight Pre-Flight"}

            <Zap size={16}/>
          </button>

          <span>
            Hindsight recall → evidence analysis → safety decision
          </span>

        </div>

      </Card>

      {error && (

        <div className="apiError">

          <AlertTriangle size={16}/>
          <span>{error}</span>

        </div>

      )}

      {!result && !evidence && (

        <Card className="memoryTrace">

          <div className="traceTitle">
            <Brain size={18}/>
            <b>
              What HandoffOS will ask Hindsight
            </b>
          </div>

          <code>
            “What historical incidents, decisions, workarounds
            and dependencies are relevant to deleting Legacy Auth?”
          </code>

          <div className="traceSteps">

            <span>1. Hindsight Recall</span>
            <ArrowRight/>
            <span>2. Evidence Analysis</span>
            <ArrowRight/>
            <span>3. Safety Decision</span>

          </div>

        </Card>

      )}

      {result && !evidence && (

        <div className="resultLayout">

          <Card className="warning">

            <div className="resultHead">

              <div className="stop">
                STOP
              </div>

              <div>

                <Badge tone="red">
                  HIGH RISK · HINDSIGHT-BACKED
                </Badge>

                <h2>
                  Historical evidence says this action is unsafe.
                </h2>

              </div>

            </div>

            <p>
              Hindsight recalled the following organizational
              memories and HandoffOS used that evidence to block
              the action.
            </p>

            <div className="liveRecall">

              {(result.recalled || [])
                .slice(0,5)
                .map((x,i) => (

                  <div key={i}>
                    <Brain size={15}/>
                    <span>{x}</span>
                  </div>

                ))}

            </div>

            <div className="why">

              <b>
                Why this warning exists
              </b>

              <span>
                {result.reflection}
              </span>

            </div>

            <div className="traceLabel">
              LIVE TRACE · {result.trace}
            </div>

          </Card>

          <Card className="newEvidence">

            <Badge tone="cyan">
              NEW EVIDENCE
            </Badge>

            <h3>
              Have conditions changed?
            </h3>

            <p>
              Retain the new evidence in Hindsight, recall it
              alongside the old context, then update the current
              state without rewriting history.
            </p>

            <div className="quote">
              “ABC completed its migration yesterday.
              Migration ticket ABC-8842 was verified.”
            </div>

            <button
              className="primary full"
              onClick={verify}
              disabled={loading}
            >
              {loading
                ? "Updating Hindsight…"
                : "Retain + verify evidence"}

              <CheckCircle2 size={16}/>

            </button>

            <small>
              Hindsight operation: retain → recall →
              HandoffOS current-state update
            </small>

          </Card>

        </div>

      )}

      {result && evidence && (

        <div className="resultLayout">

          <Card className="cleared">

            <div className="resultHead">

              <div className="stop greenStop">
                <CheckCircle2 size={27}/>
              </div>

              <div>

                <Badge tone="green">
                  CLEARED · HINDSIGHT-BACKED
                </Badge>

                <h2>
                  Risk condition resolved after verification.
                </h2>

              </div>

            </div>

            <p>
              New evidence was retained in Hindsight and
              evaluated alongside the historical memories.
            </p>

            <div className="timeline">

              <div>

                <i className="redLine"></i>

                <span>
                  2025-11-12
                </span>

                <b>
                  🔴 Unsafe — retain legacy auth
                </b>

                <small>
                  ABC dependency + previous migration failures
                </small>

              </div>

              <div>

                <i className="greenLine"></i>

                <span>
                  2026-09-28
                </span>

                <b>
                  🟢 Safe after verification
                </b>

                <small>
                  ABC-8842 confirms completed migration
                </small>

              </div>

            </div>

            <div className="why greenWhy">

              <b>
                Memory arbitration
              </b>

              <span>
                {result.reflection}
              </span>

            </div>

            <div className="traceLabel">
              LIVE TRACE · {result.trace}
            </div>

          </Card>

          <Card className="next">

            <Badge tone="green">
              NEXT STEP
            </Badge>

            <h3>
              Prove the handoff
            </h3>

            <p>
              Arjun should demonstrate that he understands why
              the service existed and what changed.
            </p>

            <button
              className="primary full"
              onClick={() => setPage("rehearsal")}
            >
              Start Handoff Rehearsal
              <ArrowRight size={16}/>
            </button>

            <div className="mini">
              <CheckCircle2/>
              Historical context preserved
            </div>

            <div className="mini">
              <CheckCircle2/>
              New evidence retained in Hindsight
            </div>

          </Card>

        </div>

      )}

    </div>
  );
}

function Evidence({icon:Icon,title,text}){

  return (
    <div className="ev">

      <Icon size={18}/>

      <div>
        <b>{title}</b>
        <span>{text}</span>
      </div>

    </div>
  );
}

function Ghosts({setPage}){

  return (
    <div className="content">

      <div className="sectionIntro">

        <div>

          <Badge tone="amber">
            KNOWLEDGE LOSS
          </Badge>

          <h2>
            Ghost knowledge is what your docs don't know they depend on.
          </h2>

          <p>
            HandoffOS finds critical practices that are concentrated
            in one person or absent from formal documentation.
          </p>

        </div>

        <button
          className="secondary"
          onClick={() => setPage("rehearsal")}
        >
          Rehearse a handoff
          <ArrowRight/>
        </button>

      </div>

      <div className="ghostLayout">

        <Card className="concentration">

          <div className="cardHead">

            <div>
              <b>Knowledge concentration</b>
              <p>
                Critical systems with single-person dependency
              </p>
            </div>

            <Badge tone="red">
              Action needed
            </Badge>

          </div>

          <div className="concentric">

            <div className="circle c3">

              <div className="circle c2">

                <div className="circle c1">

                  <div className="maya">
                    MC

                    <small>
                      Maya
                      <br/>
                      84%
                    </small>
                  </div>

                </div>

              </div>

            </div>

            <div className="legend">

              <span>
                <i className="redDot"></i>
                Critical dependency
              </span>

              <span>
                <i className="cyanDot"></i>
                Shared knowledge
              </span>

            </div>

          </div>

        </Card>

        <Card>

          <b>
            Ghost knowledge detected
          </b>

          <p className="muted">
            Practices found in activity but missing from formal documentation.
          </p>

          {[
            ["Token bridge during auth cutover","Maya Chen","Critical"],
            ["ABC rollback verification sequence","Maya Chen","High"],
            ["Legacy client routing exception","Maya Chen","High"],
            ["Nightly cache warm-up","SRE","Medium"]
          ].map(x => (

            <div
              className="ghostRow"
              key={x[0]}
            >

              <div className="ghostIcon">
                👻
              </div>

              <div>

                <b>{x[0]}</b>

                <small>
                  Observed in 6 events · owner concentration: {x[1]}
                </small>

              </div>

              <Badge
                tone={x[2]==="Critical" ? "red" : "amber"}
              >
                {x[2]}
              </Badge>

            </div>

          ))}

        </Card>

      </div>

    </div>
  );
}

function Genealogy(){

  return (
    <div className="content">

      <div className="sectionIntro">

        <div>

          <Badge tone="cyan">
            DECISION GENEALOGY
          </Badge>

          <h2>
            See why a system exists, not just what it does.
          </h2>

          <p>
            Every important decision keeps its evidence,
            owners, incidents and later revisions.
          </p>

        </div>

      </div>

      <Card className="genealogy">

        <div className="geneNode root">

          <Badge tone="cyan">
            DECISION
          </Badge>

          <h3>
            Keep legacy authentication service
          </h3>

          <p>
            Retain until enterprise migration is verified.
          </p>

          <span>
            Maya Chen · 2025-11-12
          </span>

        </div>

        <div className="geneLine"></div>

        <div className="geneBranches">

          {[
            ["INCIDENT","AUTH-1194","First migration rollback","Login token validation regressions"],
            ["INCIDENT","AUTH-1427","Second migration failure","Enterprise login failures"],
            ["DEPENDENCY","ABC-INT","Enterprise Client ABC","Legacy service still active"],
            ["WORKAROUND","OPS-22","Token bridge","Rollback path during cutover"]
          ].map(x => (

            <div
              className="geneNode"
              key={x[1]}
            >

              <Badge
                tone={x[0]==="INCIDENT" ? "red" : "slate"}
              >
                {x[0]}
              </Badge>

              <h3>{x[1]}</h3>
              <b>{x[2]}</b>
              <p>{x[3]}</p>

            </div>

          ))}

        </div>

        <div className="geneLine"></div>

        <div className="geneNode root current">

          <Badge tone="green">
            CURRENT STATE
          </Badge>

          <h3>
            Safe to decommission after ABC verification
          </h3>

          <p>
            New evidence changes the state, while the original
            rationale remains intact.
          </p>

          <span>
            Evidence: ABC-8842 · 2026-09-28
          </span>

        </div>

      </Card>

    </div>
  );
}

function Rehearsal({
  rehearsal,
  setRehearsal,
  answers,
  setAnswers,
  score
}){

  if(!rehearsal){

    return (
      <div className="content">

        <div className="rehearseHero">

          <div className="graduation">
            🎓
          </div>

          <Badge tone="cyan">
            HANDOFF REHEARSAL
          </Badge>

          <h2>
            Don't just transfer the docs.
            <br/>
            <span>
              Test whether the knowledge transferred.
            </span>
          </h2>

          <p>
            Arjun will answer four questions about the
            authentication decision. HandoffOS evaluates
            understanding of the reasoning, dependencies and changes.
          </p>

          <button
            className="primary"
            onClick={() => setRehearsal(true)}
          >
            Start rehearsal
            <ArrowRight/>
          </button>

        </div>

        <div className="rehearseStats">

          <Card>
            <strong>4</strong>
            <span>critical questions</span>
          </Card>

          <Card>
            <strong>3</strong>
            <span>knowledge dependencies</span>
          </Card>

          <Card>
            <strong>1</strong>
            <span>decision under test</span>
          </Card>

        </div>

      </div>
    );
  }

  return (
    <div className="content">

      <div className="quizHead">

        <div>

          <Badge tone="cyan">
            REHEARSAL IN PROGRESS
          </Badge>

          <h2>
            Can Arjun explain the “why”?
          </h2>

        </div>

        <div className="score">
          {score}/4
        </div>

      </div>

      {questions.map((q,i) => (

        <Card
          className="question"
          key={q.q}
        >

          <div className="qnum">
            {String(i+1).padStart(2,"0")}
          </div>

          <div className="qbody">

            <b>{q.q}</b>

            {q.opts.map((o,j) => (

              <button
                key={o}
                className={
                  answers[i]===j
                    ? (j===q.a ? "correct" : "wrong")
                    : ""
                }
                onClick={() =>
                  setAnswers({
                    ...answers,
                    [i]:j
                  })
                }
              >

                {o}

                {answers[i]===j && (
                  <>
                    {j===q.a
                      ? <CheckCircle2/>
                      : <X/>
                    }
                  </>
                )}

              </button>

            ))}

          </div>

        </Card>

      ))}

      <Card className="readiness">

        {score===4 ? (

          <>
            <CheckCircle2/>

            <div>
              <b>
                Handoff verified
              </b>

              <p>
                Arjun demonstrated understanding of the historical
                rationale and current state.
              </p>
            </div>
          </>

        ) : (

          <>
            <CircleHelp/>

            <div>

              <b>
                Knowledge still needs reinforcement
              </b>

              <p>
                Complete all questions correctly to demonstrate readiness.
              </p>

            </div>
          </>

        )}

      </Card>

    </div>
  );
}

function Graph(){

  return (
    <div className="content">

      <div className="sectionIntro">

        <div>

          <Badge tone="cyan">
            KNOWLEDGE GRAPH
          </Badge>

          <h2>
            People → systems → decisions → incidents → dependencies.
          </h2>

          <p>
            A visual map of the relationships HandoffOS uses
            to reason about organizational memory.
          </p>

        </div>

      </div>

      <Card className="graphCard">

        <svg
          viewBox="0 0 900 500"
          className="graphSvg"
        >

          <defs>

            <filter id="glow">

              <feGaussianBlur
                stdDeviation="3"
                result="b"
              />

              <feMerge>
                <feMergeNode in="b"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>

            </filter>

          </defs>

          {[
            [190,120,430,105],
            [190,120,445,245],
            [190,120,675,150],
            [445,245,675,150],
            [445,245,690,335],
            [430,105,690,335],
            [675,150,690,335],
            [690,335,500,420],
            [445,245,255,405]
          ].map((l,i) => (

            <line
              key={i}
              x1={l[0]}
              y1={l[1]}
              x2={l[2]}
              y2={l[3]}
              className="edge"
            />

          ))}

          {[
            [190,120,"Maya","person"],
            [430,105,"Legacy Auth","system"],
            [445,245,"Keep service","decision"],
            [675,150,"ABC","client"],
            [690,335,"AUTH-1427","incident"],
            [500,420,"ABC-8842","evidence"],
            [255,405,"Token bridge","workaround"]
          ].map(n => (

            <g
              key={n[2]}
              className="node"
              filter="url(#glow)"
            >

              <circle
                cx={n[0]}
                cy={n[1]}
                r="38"
              />

              <text
                x={n[0]}
                y={n[1]+4}
                textAnchor="middle"
              >
                {n[2]}
              </text>

              <text
                x={n[0]}
                y={n[1]+56}
                textAnchor="middle"
                className="nodeType"
              >
                {n[3]}
              </text>

            </g>

          ))}

        </svg>

      </Card>

    </div>
  );
}

createRoot(
  document.getElementById("root")
).render(
  <App/>
);