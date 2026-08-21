import "./TrainingCard.css";
import { useNavigate } from "react-router-dom";

export default function TrainingCard({ workout, title, date, onClick }) {
  const navigate = useNavigate();
  const cardTitle = title ?? workout?.title;

  const cardDate =
    date ??
    (workout
      ? workout.createdAt.toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : null);

  const handleClick =
    onClick ?? (() => navigate(`/app/training/${workout.id}`));

  return (
    <article className="training-card" onClick={handleClick}>
      <h2 className="training-card__title">{cardTitle}</h2>

      <div className="training-card__right">
        {cardDate && <span className="training-card__date">{cardDate}</span>}

        <svg className="training-card__arrow" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 6L15 12L9 18"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </article>
  );
}
