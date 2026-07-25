import { useState } from "react";
import ReactCompareImage from "react-compare-image";

import client01Before from "../../assets/before-after/Client-01-Before.jpg";
import client01After from "../../assets/before-after/Client-01-After.jpg";

import client02Before from "../../assets/before-after/Client-02-Before.jpg";
import client02After from "../../assets/before-after/Client-02-After.jpg";

import client03Before from "../../assets/before-after/Client-03-Before.jpg";
import client03After from "../../assets/before-after/Client-03-After.jpg";

function BeforeAfter() {
  const clients = [
    {
      before: client01Before,
      after: client01After,
      title: "Рекомпозиция. Минус 6 кг",
      subtitle: "10 месяцев работы",
    },
    {
      before: client02Before,
      after: client02After,
      title: "Рекомпозиция. Минус 6 кг",
      subtitle: "10 месяцев работы",
    },
    {
      before: client03Before,
      after: client03After,
      title: "Рекомпозиция в сторону набора мышечной массы",
      subtitle: "12 месяцев работы",
    },
  ];

  const compareHandle = (
    <div
      style={{
        width: "46px",
        height: "46px",
        borderRadius: "50%",
        background: "#161616",
        border: "2px solid #ff6200",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 0 4px rgba(255,98,0,.08), 0 0 18px rgba(255,98,0,.35)",
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 6L3 12L9 18"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M15 6L21 12L15 18"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );

  const [currentClient, setCurrentClient] = useState(0);
  const [isChanging, setIsChanging] = useState(false);

  const nextClient = () => {
    if (isChanging) return;

    setIsChanging(true);

    setTimeout(() => {
      setCurrentClient((prev) => (prev + 1) % clients.length);

      setIsChanging(false);
    }, 250);
  };

  const prevClient = () => {
    if (isChanging) return;

    setIsChanging(true);

    setTimeout(() => {
      setCurrentClient((prev) => (prev === 0 ? clients.length - 1 : prev - 1));

      setIsChanging(false);
    }, 250);
  };

  return (
    <div className="beforeAfter">
      <div className="beforeAfterCard">
        <div
          key={currentClient}
          className={`clientContent ${isChanging ? "changing" : ""}`}
        >
          <h3 className="clientTitle">{clients[currentClient].title}</h3>

          <p className="clientSubtitle">{clients[currentClient].subtitle}</p>

          <div className="compareContainer">
            <ReactCompareImage
              key={currentClient}
              leftImage={clients[currentClient].before}
              rightImage={clients[currentClient].after}
              handle={compareHandle}
              handleSize={46}
              sliderLineWidth={2}
              sliderLineColor="#ff6200"
            />
          </div>
        </div>

        <div className="clientButtons">
          <button
            className="clientArrow leftArrow"
            onClick={prevClient}
            disabled={isChanging}
            aria-label="Предыдущий клиент"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 6L9 12L15 18"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="clientDots">
            {clients.map((_, index) => (
              <button
                key={index}
                className={`clientDot ${
                  index === currentClient ? "active" : ""
                }`}
                disabled={isChanging}
                onClick={() => {
                  if (isChanging || index === currentClient) return;

                  setIsChanging(true);

                  setTimeout(() => {
                    setCurrentClient(index);
                    setIsChanging(false);
                  }, 250);
                }}
              />
            ))}
          </div>

          <button
            className="clientArrow rightArrow"
            onClick={nextClient}
            disabled={isChanging}
            aria-label="Следующий клиент"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 6L15 12L9 18"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BeforeAfter;
