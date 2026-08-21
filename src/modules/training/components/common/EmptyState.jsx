import "./EmptyState.css";

export default function EmptyState({ title, description }) {
  return (
    <div className="training-empty-state">
      <h1>{title}</h1>

      <p>{description}</p>
    </div>
  );
}
