import "./TrainingHistoryList.css";

import TrainingCard from "../cards/TrainingCard";

export default function TrainingHistoryList({ workouts }) {
  const sortedWorkouts = [...workouts].sort(
    (a, b) => b.createdAt - a.createdAt,
  );
  const groupedWorkouts = sortedWorkouts.reduce((groups, workout) => {
    const month = workout.createdAt.toLocaleDateString("ru-RU", {
      month: "long",
      year: "numeric",
    });

    const monthKey = month.charAt(0).toUpperCase() + month.slice(1);

    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }

    groups[monthKey].push(workout);

    return groups;
  }, {});

  return (
    <div className="training-history-list">
      {Object.entries(groupedWorkouts).map(([month, workouts]) => (
        <div key={month} className="training-history-group">
          <h2 className="training-history-month">{month}</h2>

          {workouts.map((workout) => (
            <TrainingCard key={workout.id} workout={workout} />
          ))}
        </div>
      ))}
    </div>
  );
}
