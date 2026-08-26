import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/shared/lib/supabaseClient";

import "./ExerciseList.css";

const exerciseGroups = [
  {
    id: "chest",
    label: "Грудь",
    muscleGroups: ["chest"],
  },
  {
    id: "back",
    label: "Спина",
    muscleGroups: ["back"],
  },
  {
    id: "legs_glutes",
    label: "Ноги",
    subLabel: "Ягодицы",
    muscleGroups: ["legs_glutes"],
  },
  {
    id: "shoulders",
    label: "Дельты",
    muscleGroups: ["shoulders"],
  },
  {
    id: "arms",
    label: "Руки",
    muscleGroups: ["arms"],
  },
  {
    id: "abs",
    label: "Пресс",
    muscleGroups: ["abs"],
  },
  {
    id: "cardio",
    label: "Кардио",
    muscleGroups: ["cardio"],
  },
  {
    id: "yoga",
    label: "Йога",
    muscleGroups: ["yoga"],
  },
];

export default function ExerciseList({ onSelect }) {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadExercises = async () => {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("exercises")
        .select("id, name, muscle_group")
        .is("user_id", null)
        .order("name", { ascending: true });

      if (!isMounted) {
        return;
      }

      if (fetchError) {
        console.error("Ошибка загрузки упражнений:", fetchError);
        setError("Не удалось загрузить упражнения");
        setExercises([]);
      } else {
        console.log("EXERCISES FROM SUPABASE:", data);

        setExercises(data ?? []);
      }

      setLoading(false);
    };

    loadExercises();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredExercises = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const activeGroup = exerciseGroups.find(
      (group) => group.id === selectedGroup,
    );

    return exercises.filter((exercise) => {
      if (
        activeGroup &&
        !activeGroup.muscleGroups.includes(exercise.muscle_group)
      ) {
        return false;
      }

      if (
        normalizedSearch &&
        !exercise.name.toLowerCase().includes(normalizedSearch)
      ) {
        return false;
      }

      return true;
    });
  }, [exercises, search, selectedGroup]);

  const handleGroupClick = (groupId) => {
    setSelectedGroup((currentGroup) =>
      currentGroup === groupId ? null : groupId,
    );

    setSearch("");
  };

  return (
    <div className="exercise-list">
      <div className="exercise-list__groups">
        {exerciseGroups.map((group) => {
          const isActive = selectedGroup === group.id;

          return (
            <button
              key={group.id}
              type="button"
              className={`exercise-list__group ${
                isActive ? "exercise-list__group--active" : ""
              }`}
              onClick={() => handleGroupClick(group.id)}
            >
              <span className="exercise-list__group-label">
                <span>{group.label}</span>

                {group.subLabel && <span>{group.subLabel}</span>}
              </span>
            </button>
          );
        })}
      </div>

      <div className="exercise-list__search">
        <input
          type="search"
          className="exercise-list__search-input"
          placeholder="Поиск упражнения"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="exercise-list__items">
        {loading && (
          <div className="exercise-list__empty">Загрузка упражнений</div>
        )}

        {!loading && error && (
          <div className="exercise-list__empty">{error}</div>
        )}

        {!loading && !error && filteredExercises.length === 0 && (
          <div className="exercise-list__empty">Ничего не найдено</div>
        )}

        {!loading &&
          !error &&
          filteredExercises.map((exercise) => (
            <button
              key={exercise.id}
              type="button"
              className="exercise-list__item"
              onClick={() => onSelect?.(exercise)}
            >
              <span
                style={{
                  whiteSpace: "normal",
                  overflow: "visible",
                  textOverflow: "clip",
                }}
              >
                {exercise.name}
              </span>
            </button>
          ))}
      </div>
    </div>
  );
}
