import "react-grab";
import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

const questions = [
  {
    id: 1,
    title: "Quel est l'ordre correct des organes du tube digestif ?",
    options: [
      "Bouche → œsophage → estomac → intestin grêle → gros intestin",
      "Bouche → estomac → œsophage → intestin grêle → gros intestin",
      "Bouche → intestin grêle → estomac → œsophage → gros intestin"
    ],
    correctIndex: 0,
    explanation:
      "Les aliments cheminent dans cet ordre précis afin d'être broyés, digérés puis absorbés."
  },
  {
    id: 2,
    title: "Quelle structure relie la bouche à l'estomac ?",
    options: ["La trachée", "L'œsophage", "Le duodénum"],
    correctIndex: 1,
    explanation:
      "L'œsophage est le conduit musculaire qui transporte le bol alimentaire vers l'estomac par péristaltisme.",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    title: "Quel organe produit la bile indispensable à l'émulsification des lipides ?",
    options: ["La vésicule biliaire", "Le foie", "Le pancréas"],
    correctIndex: 1,
    explanation:
      "Le foie fabrique la bile qui est ensuite stockée et concentrée dans la vésicule biliaire."
  },
  {
    id: 4,
    title: "Comment se nomme la première portion de l'intestin grêle ?",
    options: ["Le jéjunum", "Le duodénum", "L'iléon"],
    correctIndex: 1,
    explanation:
      "Le duodénum reçoit la bile et le suc pancréatique pour poursuivre la digestion chimique.",
    image:
      "https://images.unsplash.com/photo-1582719478181-2cf4e1e68b0d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    title: "Quelle est la fonction principale de l'estomac ?",
    options: [
      "Absorber la majorité des nutriments",
      "Stocker et brasser les aliments avec les sucs gastriques",
      "Produire le glucose"
    ],
    correctIndex: 1,
    explanation:
      "L'estomac mélange mécaniquement les aliments avec l'acide chlorhydrique et la pepsine pour débuter la digestion des protéines."
  },
  {
    id: 6,
    title: "Quel organe sécrète les enzymes digestives qui agissent sur glucides, lipides et protéines ?",
    options: ["La rate", "Le pancréas", "Le côlon"],
    correctIndex: 1,
    explanation:
      "Le pancréas libère dans le duodénum un suc riche en enzymes spécifiques à chaque macronutriment."
  },
  {
    id: 7,
    title: "Dans quelle partie de l'intestin grêle se déroule l'essentiel de l'absorption des nutriments ?",
    options: ["Le jéjunum", "Le cæcum", "Le rectum"],
    correctIndex: 0,
    explanation:
      "Le jéjunum possède de nombreuses villosités et microvillosités qui maximisent l'absorption."
  },
  {
    id: 8,
    title: "Quelle est la principale fonction du gros intestin ?",
    options: [
      "Digérer les lipides",
      "Réabsorber l'eau et former les matières fécales",
      "Produire des hormones digestives"
    ],
    correctIndex: 1,
    explanation:
      "Le gros intestin concentre les résidus en retirant l'eau et héberge un microbiote actif."
  },
  {
    id: 9,
    title: "Quelle vitamine est principalement synthétisée par le microbiote intestinal ?",
    options: ["Vitamine K", "Vitamine C", "Vitamine D"],
    correctIndex: 0,
    explanation:
      "Les bactéries du côlon participent notamment à la production de vitamine K, utile à la coagulation."
  },
  {
    id: 10,
    title: "Comment appelle-t-on le mouvement musculaire qui fait avancer le bol alimentaire dans le tube digestif ?",
    options: ["La filtration", "Le péristaltisme", "La déglutition"],
    correctIndex: 1,
    explanation:
      "Le péristaltisme est une succession de contractions musculaires involontaires qui propulsent les aliments.",
    image:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80"
  }
];

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const progress = useMemo(
    () => ((currentQuestion + (selected !== null ? 1 : 0)) / questions.length) * 100,
    [currentQuestion, selected]
  );

  const current = questions[currentQuestion];

  const handleOptionSelect = (index) => {
    if (selected !== null) return;
    setSelected(index);
    setAnswers((prev) => [
      ...prev,
      {
        questionId: current.id,
        chosen: index,
        correct: index === current.correctIndex
      }
    ]);
  };

  const handleNext = () => {
    if (selected === null) return;
    if (currentQuestion === questions.length - 1) {
      setShowResults(true);
    } else {
      setCurrentQuestion((prev) => prev + 1);
    }
    setSelected(null);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelected(null);
    setAnswers([]);
    setShowResults(false);
  };

  const score = useMemo(
    () => answers.filter((answer) => answer.correct).length,
    [answers]
  );

  return (
    <div
      style={{
        fontFamily: "'DM Sans', ui-sans-serif, system-ui, -apple-system",
        minHeight: "100vh",
        margin: 0,
        padding: "3rem 1rem",
        background: "linear-gradient(135deg, #f7f9fc 0%, #edf2ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          width: "min(680px, 100%)",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          borderRadius: "28px",
          boxShadow: "0 40px 70px -45px rgba(52, 84, 209, 0.6)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(149, 163, 255, 0.2)",
          padding: "2.5rem 3rem",
          display: "flex",
          flexDirection: "column",
          gap: "2rem"
        }}
      >
        <header style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: "#5563c1",
              textTransform: "uppercase"
            }}>
              Mission Système Digestif
            </span>
            <span style={{
              fontSize: "0.95rem",
              fontWeight: 500,
              color: "#6b7280"
            }}>
              Question {currentQuestion + 1} / {questions.length}
            </span>
          </div>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "8px",
              borderRadius: "999px",
              background: "rgba(85, 99, 193, 0.12)"
            }}
          >
            <span
              style={{
                position: "absolute",
                inset: 0,
                width: `${progress}%`,
                borderRadius: "999px",
                background: "linear-gradient(90deg, #5a73f0 0%, #7f9fff 100%)",
                transition: "width 0.35s ease"
              }}
            />
          </div>
        </header>

        {!showResults ? (
          <main style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <h1 style={{
              fontSize: "2rem",
              color: "#172554",
              margin: 0,
              lineHeight: 1.2,
              fontWeight: 700
            }}>
              {current.title}
            </h1>
            {current.image && (
              <div
                style={{
                  borderRadius: "20px",
                  overflow: "hidden",
                  border: "1px solid rgba(90, 115, 240, 0.15)",
                  boxShadow: "0 30px 45px -40px rgba(44, 82, 130, 0.6)"
                }}
              >
                <img
                  src={current.image}
                  alt="Illustration pédagogique du système digestif"
                  style={{ display: "block", width: "100%", objectFit: "cover", maxHeight: "220px" }}
                />
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {current.options.map((option, index) => {
                const isSelected = selected === index;
                const isCorrect = selected !== null && index === current.correctIndex;
                const isWrong = isSelected && !isCorrect;

                return (
                  <button
                    key={option}
                    onClick={() => handleOptionSelect(index)}
                    style={{
                      textAlign: "left",
                      padding: "1.15rem 1.25rem",
                      fontSize: "1rem",
                      borderRadius: "18px",
                      border: "1px solid",
                      borderColor: isCorrect
                        ? "rgba(22, 163, 74, 0.4)"
                        : isWrong
                        ? "rgba(239, 68, 68, 0.4)"
                        : "rgba(90, 115, 240, 0.2)",
                      backgroundColor: isCorrect
                        ? "rgba(22, 163, 74, 0.12)"
                        : isWrong
                        ? "rgba(239, 68, 68, 0.12)"
                        : "rgba(255, 255, 255, 0.9)",
                      color: isCorrect
                        ? "#166534"
                        : isWrong
                        ? "#b91c1c"
                        : "#1f2937",
                      cursor: selected === null ? "pointer" : "default",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      boxShadow:
                        isSelected
                          ? "0 20px 40px -32px rgba(90, 115, 240, 0.55)"
                          : "0 12px 30px -28px rgba(17, 24, 39, 0.3)",
                      transform: isSelected ? "translateY(-2px)" : "none"
                    }}
                    disabled={selected !== null}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span
                        aria-hidden
                        style={{
                          width: "2.2rem",
                          height: "2.2rem",
                          borderRadius: "14px",
                          backgroundColor: isSelected ? "#5a73f0" : "rgba(90, 115, 240, 0.1)",
                          color: isSelected ? "white" : "#5a73f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          transition: "background 0.25s ease, color 0.25s ease"
                        }}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span style={{ flex: 1 }}>{option}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <div
                style={{
                  padding: "1.25rem",
                  borderRadius: "18px",
                  background: "rgba(90, 115, 240, 0.08)",
                  border: "1px solid rgba(90, 115, 240, 0.25)",
                  color: "#1f2937",
                  fontSize: "0.95rem",
                  lineHeight: 1.5
                }}
              >
                <strong style={{ display: "block", color: "#3847b3", marginBottom: "0.25rem" }}>
                  {selected === current.correctIndex
                    ? "Bravo, mission réussie !"
                    : "Bonne tentative !"}
                </strong>
                {current.explanation}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#6b7280", fontSize: "0.95rem" }}>
                {selected === null ? "Choisis une réponse pour continuer." : "Clique sur continuer pour la prochaine étape."}
              </span>
              <button
                onClick={handleNext}
                disabled={selected === null}
                style={{
                  padding: "0.9rem 1.8rem",
                  borderRadius: "999px",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: selected === null ? "#cbd5f5" : "white",
                  background: selected === null
                    ? "rgba(90, 115, 240, 0.35)"
                    : "linear-gradient(120deg, #5a73f0 0%, #7f9fff 100%)",
                  cursor: selected === null ? "not-allowed" : "pointer",
                  boxShadow: selected === null
                    ? "none"
                    : "0 25px 45px -35px rgba(90, 115, 240, 0.7)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease"
                }}
              >
                {currentQuestion === questions.length - 1 ? "Voir les résultats" : "Continuer"}
              </button>
            </div>
          </main>
        ) : (
          <main style={{ display: "flex", flexDirection: "column", gap: "1.5rem", textAlign: "center" }}>
            <h1 style={{
              fontSize: "2.3rem",
              color: "#172554",
              margin: 0,
              fontWeight: 800
            }}>
              Bilan de mission
            </h1>
            <p style={{ color: "#475569", fontSize: "1.05rem", margin: 0 }}>
              Tu as obtenu <strong style={{ color: "#5a73f0" }}>{score}</strong> bonnes réponses sur {questions.length}.
            </p>

            <div
              style={{
                display: "grid",
                gap: "0.75rem",
                textAlign: "left",
                background: "rgba(90, 115, 240, 0.05)",
                borderRadius: "20px",
                padding: "1.75rem",
                border: "1px solid rgba(90, 115, 240, 0.2)"
              }}
            >
              {questions.map((question, index) => {
                const answer = answers[index];
                const isCorrect = answer?.correct;

                return (
                  <div
                    key={question.id}
                    style={{
                      display: "grid",
                      gap: "0.35rem",
                      paddingBottom: "0.75rem",
                      borderBottom:
                        index === questions.length - 1
                          ? "none"
                          : "1px dashed rgba(90, 115, 240, 0.2)"
                    }}
                  >
                    <span style={{
                      fontSize: "0.85rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: isCorrect ? "#16a34a" : "#ef4444",
                      fontWeight: 700
                    }}>
                      {isCorrect ? "Réponse juste" : "Réponse à revoir"}
                    </span>
                    <span style={{ fontWeight: 600, color: "#1f2937" }}>
                      {index + 1}. {question.title}
                    </span>
                    <span style={{ color: "#475569", fontSize: "0.95rem" }}>
                      ✅ Bonne réponse : {question.options[question.correctIndex]}
                    </span>
                    {!isCorrect && answer && (
                      <span style={{ color: "#ef4444", fontSize: "0.9rem" }}>
                        Ta réponse : {question.options[answer.chosen]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={resetQuiz}
              style={{
                alignSelf: "center",
                padding: "0.9rem 2.5rem",
                borderRadius: "999px",
                border: "none",
                fontSize: "1rem",
                fontWeight: 600,
                color: "white",
                background: "linear-gradient(120deg, #5a73f0 0%, #7f9fff 100%)",
                cursor: "pointer",
                boxShadow: "0 30px 60px -35px rgba(90, 115, 240, 0.75)",
                transition: "transform 0.2s ease"
              }}
            >
              Rejouer la mission
            </button>
          </main>
        )}
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element with id "root" not found');
}

const root = createRoot(rootElement);
root.render(<App />);
