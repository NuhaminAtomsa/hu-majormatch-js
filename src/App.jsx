import React, { useMemo, useState } from "react";
import { QUESTIONS } from "./data/questions.js";
import { DEPARTMENTS } from "./data/departments.js";
import { recommendDepartments } from "./utils/recommender.js";

const initialAnswers = {
  subjects: [],
  skillLevel: "",
  careerInterest: "",
  studyStyle: "",
  mathComfort: "",
  gpaRange: ""
};

function ProgressBar({ stepIndex, totalSteps }) {
  const pct = Math.round(((stepIndex + 1) / totalSteps) * 100);
  return (
    <div className="progressWrap" aria-label="Progress">
      <div className="progressMeta">
        <span className="progressText">Step {stepIndex + 1} of {totalSteps}</span>
        <span className="progressPct">{pct}%</span>
      </div>
      <div className="progressTrack" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <div className="progressFill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Pill({ active, disabled, children, onClick }) {
  return (
    <button
      type="button"
      className={`pill ${active ? "isActive" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function Card({ children }) {
  return <div className="card">{children}</div>;
}

function ResultCard({ dept, onCompareToggle, compareActive }) {
  return (
    <div className="resultCard">
      <div className="resultTop">
        <div>
          <div className="deptName">{dept.name}</div>
          <div className="deptMeta">
            <span className="badge">{dept.mathIntensity} Math</span>
            <span className="muted">Career: {dept.careerPaths.join(", ")}</span>
          </div>
        </div>

        <div className="matchRing" aria-label={`Match ${dept.percent}%`}>
          <div className="matchPct">{dept.percent}%</div>
          <div className="matchLabel">match</div>
        </div>
      </div>

      <p className="explain">{dept.explanation}</p>

      <div className="resultFooter">
        <div className="tagsRow" aria-label="Preferred subjects">
          {dept.preferredSubjects.map((s) => (
            <span key={s} className="tag">{s}</span>
          ))}
        </div>

        <button
          type="button"
          className={`btn btnGhost ${compareActive ? "btnGhostActive" : ""}`}
          onClick={onCompareToggle}
        >
          {compareActive ? "Selected" : "Compare"}
        </button>
      </div>
    </div>
  );
}

function ComparePanel({ a, b, onClose }) {
  return (
    <div className="compareWrap" role="dialog" aria-modal="true" aria-label="Compare departments">
      <div className="compareCard">
        <div className="compareHeader">
          <div className="compareTitle">Compare</div>
          <button type="button" className="iconBtn" onClick={onClose} aria-label="Close compare">
            ✕
          </button>
        </div>

        <div className="compareGrid">
          {[a, b].map((d) => (
            <div key={d.id} className="compareCol">
              <div className="compareName">{d.name}</div>

              <div className="compareSection">
                <div className="compareLabel">Match</div>
                <div className="compareValue">{d.percent}%</div>
              </div>

              <div className="compareSection">
                <div className="compareLabel">Math intensity</div>
                <div className="compareValue">{d.mathIntensity}</div>
              </div>

              <div className="compareSection">
                <div className="compareLabel">Preferred subjects</div>
                <div className="compareValue">{d.preferredSubjects.join(", ")}</div>
              </div>

              <div className="compareSection">
                <div className="compareLabel">Career paths</div>
                <div className="compareValue">{d.careerPaths.join(", ")}</div>
              </div>

              <div className="compareSection">
                <div className="compareLabel">Key explanation</div>
                <div className="compareValue small">{d.explanation}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="compareActions">
          <button type="button" className="btn" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("welcome"); // welcome | quiz | results
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [compareIds, setCompareIds] = useState([]);

  const totalSteps = QUESTIONS.length;

  const { top, all } = useMemo(() => {
    return recommendDepartments(answers, DEPARTMENTS);
  }, [answers]);

  const currentQuestion = QUESTIONS[step];

  const canGoNext = useMemo(() => {
    if (!currentQuestion) return false;
    const v = answers[currentQuestion.id];

    if (currentQuestion.optional) return true;

    if (currentQuestion.type === "multi") return Array.isArray(v) && v.length > 0;
    return typeof v === "string" && v.trim().length > 0;
  }, [answers, currentQuestion]);

  const start = () => {
    setScreen("quiz");
    setStep(0);
    setAnswers(initialAnswers);
    setCompareIds([]);
  };

  const restart = () => {
    setScreen("welcome");
    setStep(0);
    setAnswers(initialAnswers);
    setCompareIds([]);
  };

  const goNext = () => {
    if (step < totalSteps - 1) setStep((s) => s + 1);
    else setScreen("results");
  };

  const goBack = () => {
    if (step > 0) setStep((s) => s - 1);
    else setScreen("welcome");
  };

  const setSingle = (id, value) => {
    setAnswers((a) => ({ ...a, [id]: value }));
  };

  const toggleMulti = (id, value, max) => {
    setAnswers((a) => {
      const cur = Array.isArray(a[id]) ? a[id] : [];
      const has = cur.includes(value);
      if (has) return { ...a, [id]: cur.filter((x) => x !== value) };
      if (typeof max === "number" && cur.length >= max) return a;
      return { ...a, [id]: [...cur, value] };
    });
  };

  const toggleCompare = (deptId) => {
    setCompareIds((ids) => {
      const has = ids.includes(deptId);
      if (has) return ids.filter((x) => x !== deptId);
      if (ids.length >= 2) return [ids[1], deptId];
      return [...ids, deptId];
    });
  };

  const compareA = all.find((d) => d.id === compareIds[0]);
  const compareB = all.find((d) => d.id === compareIds[1]);
  const showCompare = Boolean(compareA && compareB);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
        <img className="logo" src="/hu-logo.jpg" alt="Haramaya University" />          <div>
            <div className="brandTitle">HU MajorMatch</div>
            <div className="brandSub">Find a department that fits your strengths</div>
          </div>
        </div>

        {screen !== "welcome" && (
          <button type="button" className="btn btnGhost" onClick={restart}>
            Restart
          </button>
        )}
      </header>

      <main className="container">
        {screen === "welcome" && (
          <div className="hero">
            <div className="heroLeft">
              <div className="kicker">Haramaya University</div>
              <h1 className="title">Choose your best-fit department — confidently.</h1>
              <p className="subtitle">
                Answer a few questions and get your top department matches with friendly AI-style reasoning.
                No internet, no real AI — just smart local logic you can demo.
              </p>

              <div className="heroActions">
                <button type="button" className="btn" onClick={start}>
                  Start
                </button>
                <div className="hint">Takes about 1 minute</div>
              </div>

              <div className="miniStats">
                <div className="miniStat">
                  <div className="miniNum">9</div>
                  <div className="miniLbl">Departments</div>
                </div>
                <div className="miniStat">
                  <div className="miniNum">6</div>
                  <div className="miniLbl">Questions</div>
                </div>
                <div className="miniStat">
                  <div className="miniNum">Top 3</div>
                  <div className="miniLbl">Matches</div>
                </div>
              </div>
            </div>

            <div className="heroRight">
              <Card>
                <div className="previewTitle">How it works</div>
                <ul className="previewList">
                  <li>Pick your favorite subjects</li>
                  <li>Tell us your learning style and goals</li>
                  <li>Get ranked recommendations + explanations</li>
                </ul>
                <div className="previewNote">
                  Tip: You can compare two departments on the results page.
                </div>
              </Card>
            </div>
          </div>
        )}

        {screen === "quiz" && (
          <div className="quiz">
            <ProgressBar stepIndex={step} totalSteps={totalSteps} />

            <Card>
              <div className="qHeader">
                <div className="qTitle">{currentQuestion.title}</div>
                <div className="qSub">{currentQuestion.subtitle}</div>
              </div>

              <div className="qBody" role="group" aria-label={currentQuestion.title}>
                {currentQuestion.type === "multi" && (
                  <>
                    <div className="pills">
                      {currentQuestion.options.map((opt) => {
                        const cur = answers[currentQuestion.id] ?? [];
                        const active = cur.includes(opt);
                        const max = currentQuestion.max ?? 99;
                        const disabled = !active && cur.length >= max;

                        return (
                          <Pill
                            key={opt}
                            active={active}
                            disabled={disabled}
                            onClick={() => toggleMulti(currentQuestion.id, opt, max)}
                          >
                            {opt}
                          </Pill>
                        );
                      })}
                    </div>

                    <div className="helperRow">
                      <span className="muted">
                        Selected: {(answers[currentQuestion.id] ?? []).length}/{currentQuestion.max}
                      </span>
                      <span className="muted">Click again to unselect</span>
                    </div>
                  </>
                )}

                {currentQuestion.type === "single" && (
                  <div className="pills">
                    {currentQuestion.options.map((opt) => {
                      const active = answers[currentQuestion.id] === opt;
                      return (
                        <Pill
                          key={opt}
                          active={active}
                          onClick={() => setSingle(currentQuestion.id, opt)}
                        >
                          {opt}
                        </Pill>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="actionsRow">
                <button type="button" className="btn btnGhost" onClick={goBack}>
                  Back
                </button>

                <button type="button" className="btn" onClick={goNext} disabled={!canGoNext}>
                  {step === totalSteps - 1 ? "See results" : "Next"}
                </button>
              </div>

              <div className="livePeek">
                <div className="liveTitle">Live top matches (preview)</div>
                <div className="liveGrid">
                  {top.map((d) => (
                    <div key={d.id} className="liveItem">
                      <div className="liveName">{d.name}</div>
                      <div className="livePct">{d.percent}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {screen === "results" && (
          <div className="results">
            <div className="resultsHeader">
              <div>
                <h2 className="resultsTitle">Your top matches</h2>
                <p className="resultsSub">These are the 3 departments that best match your answers.</p>
              </div>

              <div className="resultsActions">
                <button type="button" className="btn btnGhost" onClick={() => setScreen("quiz")}>
                  Edit answers
                </button>
                <button type="button" className="btn" onClick={restart}>
                  Restart
                </button>
              </div>
            </div>

            <div className="resultsGrid">
              {top.map((dept) => (
                <ResultCard
                  key={dept.id}
                  dept={dept}
                  compareActive={compareIds.includes(dept.id)}
                  onCompareToggle={() => toggleCompare(dept.id)}
                />
              ))}
            </div>

            <Card>
              <div className="moreTitle">All departments (ranked)</div>
              <div className="table">
                {all.map((d, idx) => (
                  <div key={d.id} className="row">
                    <div className="cell rank">{idx + 1}</div>
                    <div className="cell name">{d.name}</div>
                    <div className="cell pct">{d.percent}%</div>
                    <div className="cell meta">{d.mathIntensity} Math</div>
                  </div>
                ))}
              </div>
              <div className="muted small mt8">
                Compare: select any two from the top 3 cards.
              </div>
            </Card>

            {showCompare && (
              <ComparePanel
                a={compareA}
                b={compareB}
                onClose={() => setCompareIds([])}
              />
            )}
          </div>
        )}
      </main>

      <footer className="footer">
  <span className="muted">Built by Nuhamin Atomsa</span>
</footer>
    </div>
  );
}