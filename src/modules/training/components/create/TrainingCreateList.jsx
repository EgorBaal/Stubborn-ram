import "./TrainingCreateList.css";
import { useNavigate } from "react-router-dom";

import TrainingCreateCard from "./TrainingCreateCard";

export default function TrainingCreateList() {
  const navigate = useNavigate();

  return (
    <div className="training-create-list">
      <div className="training-create-group">
        <h2 className="training-create-title">Шаблоны</h2>

        {templates.map((template) => (
          <TrainingCreateCard
            key={template.id}
            title={template.title}
            onClick={() => navigate(`/app/training/template/${template.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
