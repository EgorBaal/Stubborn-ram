import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./ExerciseList.css";

import { createExercise, getExercises } from "../../services/trainingService";

const exerciseGroups = [
  {
    id: "chest",
    label: "Грудь",
    category: "Грудь",
  },
  {
    id: "back",
    label: "Спина",
    category: "Спина",
  },
  {
    id: "legs_glutes",
    label: "Ноги",
    subLabel: "Ягодицы",
    category: "Ноги / Ягодицы",
  },
  {
    id: "shoulders",
    label: "Дельты",
    category: "Дельты",
  },
  {
    id: "arms",
    label: "Руки",
    category: "Руки",
  },
  {
    id: "abs",
    label: "Пресс",
    category: "Пресс",
  },
  {
    id: "cardio",
    label: "Кардио",
    category: "Кардио",
  },
  {
    id: "yoga",
    label: "Йога",
    category: "Йога",
  },
];

export default function ExerciseList({ onSelect, onCreateModeChange }) {
  const navigate = useNavigate();

  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseGroup, setNewExerciseGroup] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadExercises = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getExercises();

        if (!isMounted) {
          return;
        }

        setExercises(data);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Ошибка загрузки упражнений:", error);
        setError(error.message || "Не удалось загрузить упражнения.");
        setExercises([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
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
      if (activeGroup && exercise.category !== activeGroup.category) {
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

  const handleOpenCreate = () => {
    setIsCreating(true);
    setNewExerciseName("");
    setNewExerciseGroup(selectedGroup);
    setCreateError("");
    onCreateModeChange?.(true);
  };

  const handleCreateExercise = async (event) => {
    event.preventDefault();

    const normalizedName = newExerciseName.trim();

    if (!normalizedName) {
      setCreateError("Введите название упражнения.");
      return;
    }

    if (!newExerciseGroup) {
      setCreateError("Выберите группу мышц.");
      return;
    }

    const selectedExerciseGroup = exerciseGroups.find(
      (group) => group.id === newExerciseGroup,
    );

    const category = selectedExerciseGroup?.category;

    if (!category) {
      setCreateError("Не удалось определить категорию.");
      return;
    }

    setCreateLoading(true);
    setCreateError("");

    try {
      const exercise = await createExercise({
        name: normalizedName,
        category,
      });

      if (!exercise) {
        throw new Error("Не удалось получить созданное упражнение.");
      }

      setExercises((currentExercises) => [...currentExercises, exercise]);

      setIsCreating(false);
      setNewExerciseName("");
      setNewExerciseGroup(null);
      onCreateModeChange?.(false);

      onSelect?.(exercise);
    } catch (error) {
      console.error("Ошибка создания упражнения:", error);
      setCreateError(error.message || "Не удалось создать упражнение.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleExerciseClick = (exercise) => {
    if (onSelect) {
      onSelect(exercise);
      return;
    }

    navigate(`/app/training/exercises/${exercise.id}`);
  };

  if (isCreating) {
    return (
      <div className="exercise-list exercise-list--create">
        <form
          className="exercise-list__create-form"
          onSubmit={handleCreateExercise}
        >
          <div className="exercise-list__create-field">
            <input
              id="new-exercise-name"
              type="text"
              className="exercise-list__create-input"
              placeholder="Название упражнения"
              value={newExerciseName}
              onChange={(event) => {
                setNewExerciseName(event.target.value);
                setCreateError("");
              }}
              disabled={createLoading}
              autoFocus
            />
          </div>

          <div className="exercise-list__create-field">
            <span className="exercise-list__create-label">Группа мышц</span>

            <div className="exercise-list__create-groups">
              {exerciseGroups.map((group) => {
                const isActive = newExerciseGroup === group.id;

                return (
                  <button
                    key={group.id}
                    type="button"
                    className={`exercise-list__create-group ${
                      isActive ? "exercise-list__create-group--active" : ""
                    }`}
                    onClick={() => {
                      setNewExerciseGroup(group.id);
                      setCreateError("");
                    }}
                    disabled={createLoading}
                  >
                    <span>{group.label}</span>

                    {group.subLabel && <span>{group.subLabel}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {createError && (
            <div className="exercise-list__create-error">{createError}</div>
          )}

          <button
            type="submit"
            className="exercise-list__create-submit"
            disabled={createLoading}
          >
            {createLoading ? "Создание..." : "Создать упражнение"}
          </button>
        </form>
      </div>
    );
  }

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

      <div className="exercise-list__create-action">
        <button
          type="button"
          className="exercise-list__create-button"
          onClick={handleOpenCreate}
        >
          <span>Создать своё упражнение</span>
        </button>
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
              onClick={() => handleExerciseClick(exercise)}
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
