import { useState } from "react";
import { characterDetails } from "./quizzses";
import "./QuestPage.css";

function QuizPage({ quiz, onBack, setQuizTotalCount }) {
  // Store the selected answer for each question by its index.
  const [answers, setAnswers] = useState({});

  // Track whether the quiz has been submitted and which result view is open.
  const [QuizFinished, setQuizFinished] = useState(false);
  const [message, setMessage] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [pageColor] = useState(
    localStorage.getItem("PageColor") || "Main"
  );

  if (!quiz || !quiz.questions) {
    return (
      <div
        className="QuizContainer"
        style={{
          color: "white",
          textAlign: "center",
          padding: "50px"
        }}
      >
        <h2>Quiz verisi yüklenemedi!</h2>
        <button onClick={onBack}>Geri Dön</button>
      </div>
    );
  }

  // Convert the stored theme name into a CSS background value.
  const quizBackground =
    pageColor === "Changed"
      ? "black"
      : "linear-gradient(135deg, red, blue, purple)";

  function choice(option, questionIndex) {
    // Update only the answer belonging to the selected question.
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: option
    }));
  }

  function finishQuiz() {
    // Do not allow the user to submit until every question has an answer.
    if (Object.keys(answers).length < quiz.questions.length) {
      setMessage(
        "Lütfen Quiz'i bitirmeden önce Tüm soruları cevapla !"
      );
      return;
    }

    setQuizFinished(true);
  }

  function HandleBack() {
    // Count a quiz only when the user leaves a completed result screen.
    if (QuizFinished) {
      setQuizTotalCount((prev) => prev + 1);
    }

    onBack();
  }

  function getKnowledgeResult() {
    // Calculate correct answers and convert the result to a percentage.
    let correct = 0;

    quiz.questions.forEach((question, index) => {
      const answer = answers[index];

      if (answer.charAt(0) === question.correctAnswer) {
        correct++;
      }
    });

    const wrong = quiz.questions.length - correct;

    const point = Math.round(
      (correct / quiz.questions.length) * 100
    );

    return {
      correct,
      wrong,
      point
    };
  }

  function getPersonailtyResult() {
    // Count how often each character is selected by the user's answers.
    const scores = {};

    quiz.questions.forEach((question, index) => {
      const answer = answers[index];
      const letter = answer.charAt(0);

      let characters = [];

      if (question.scores) {
        characters = question.scores[letter] || [];
      }

      if (quiz.resultMap) {
        characters = [quiz.resultMap[letter]];
      }

      characters.forEach((character) => {
        if (character) {
          scores[character] =
            (scores[character] || 0) + 1;
        }
      });
    });

    return scores;
  }

  if (QuizFinished) {
    // Knowledge quizzes show a score and an optional answer review.
    if (quiz.type === "knowladge") {
      const result = getKnowledgeResult();

      return (
        <div
          className="QuizContainer"
          style={{ background: quizBackground }}
        >
          <h2>{quiz.title}</h2>

          <p>
            Doğru Cevap Sayısı: {result.correct}
          </p>

          <p>
            Yanlış Cevaplananlar: {result.wrong}
          </p>

          <p>
            PUAN: {result.point} / 100
          </p>

          {result.wrong > 0 && !showReview && (
            <button onClick={() => setShowReview(true)}>
              Sonuçları Kontrol Et !
            </button>
          )}

          {showReview && (
            <div className="AnswerReview">
              {/* Compare every selected answer with the correct answer. */}
              {quiz.questions.map((question, index) => {
                const selectedAnswer = answers[index];

                const isCorrect =
                  selectedAnswer.charAt(0) ===
                  question.correctAnswer;

                const correctAnswer = question.options.find(
                  (option) =>
                    option.charAt(0) ===
                    question.correctAnswer
                );

                return (
                  <div
                    key={index}
                    className="ReviewQuestion"
                  >
                    <h3>
                      {index + 1}. {question.quesiton}
                    </h3>

                    <p
                      className={
                        isCorrect
                          ? "CorrectAnswer"
                          : "WrongAnswer"
                      }
                    >
                      Senin cevabın: {selectedAnswer}
                    </p>

                    {!isCorrect && (
                      <p className="CorrectAnswer">
                        Doğru cevap: {correctAnswer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <button onClick={HandleBack}>
            GERİ
          </button>
        </div>
      );
    }

    // Personality quizzes show the character with the highest score.
    const scores = getPersonailtyResult();

    const bestCharacter = Object.entries(scores).sort(
      (a, b) => b[1] - a[1]
    )[0];

    const characterName = bestCharacter?.[0];
    const characterInfo = characterDetails[characterName];

    const handleCharacterImageError = () =>
      setImageError(true);

    return (
      <div
        className="QuizContainer"
        style={{ background: quizBackground }}
      >
        <h2>{quiz.title}</h2>

        <p>Sonucun:</p>

        <h2>
          {characterName || "Sonuç bulunamadı"}
        </h2>

        {characterInfo && (
          <div className="CharacterResult">
            {characterInfo.image && !imageError && (
              <img
                src={characterInfo.image}
                alt={characterName}
                className="CharacterResultImage"
                onError={handleCharacterImageError}
              />
            )}

            {imageError && (
              <div className="CharacterFallback">
                {characterName || "Sonuç"}
              </div>
            )}

            <p>
              {characterInfo.description}
            </p>
          </div>
        )}

        <button onClick={HandleBack}>
          GERİ
        </button>
      </div>
    );
  }

  return (
    <div
      className="QuizContainer"
      style={{ background: quizBackground }}
    >
      <div className="AllQuestIndex">
        <div className="QuestionItems">
          <div className="OptionItems">
            <h1 className="QuizTitle">
              {quiz.title}
            </h1>

            {/* Render every question and its available options. */}
            {quiz.questions.map((question, index) => (
              <div key={index}>
                <h3 className="QuestionStyle">
                  {question.quesiton}
                </h3>

                {question.options.map((option) => {
                  const letter = option.charAt(0);

                  // Personality quizzes may provide extra details for each option.
                  const details =
                    question.optionDetails?.[letter];

                  return (
                    <button
                      className={`OptionStyles ${
                        answers[index] === option
                          ? "selectedOption"
                          : ""
                      }`}
                      key={option}
                      onClick={() =>
                        choice(option, index)
                      }
                    >
                      <div>
                        {option}
                      </div>

                      {details && (
                        <div className="OptionDetails">
                          <p className="OptionDescription">
                            {details.description}
                          </p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            <div className="FinishQuizBtn">
              <button onClick={finishQuiz}>
                Testi Bitir
              </button>

              <p>{message}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizPage;