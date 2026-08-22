import "./TrainingCreateList.css";
import { useNavigate } from "react-router-dom";

import TrainingCreateCard from "./TrainingCreateCard";

export default function TrainingCreateList() {
  const navigate = useNavigate();
  const templates = [
    { id: 1, title: "Фулбади" },
    { id: 2, title: "Верх тела" },
    { id: 3, title: "Ноги" },
    { id: 4, title: "Push" },
    { id: 5, title: "Pull" },
    { id: 6, title: "Upper" },
    { id: 7, title: "Lower" },
    { id: 8, title: "Спина" },
    { id: 9, title: "Грудь" },
    { id: 10, title: "Плечи" },
    { id: 11, title: "Руки" },
    { id: 12, title: "Кардио" },
  ];

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
