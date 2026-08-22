import "./TrainingCreateCard.css";

export default function TrainingCreateCard({
  title,
  onClick,
}) {
  return (
    <article
      className="training-create-card"
      onClick={onClick}
    >
      <h2 className="training-create-card__title">
        {title}
      </h2>

      <div className="training-create-card__right">
        <svg
          className="training-create-card__arrow"
          viewBox="0 0 24 24"
          fill="none"
        >
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