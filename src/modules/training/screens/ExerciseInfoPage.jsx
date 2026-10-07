import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getExerciseById, updateExercise } from "../services/trainingService";
import "../styles/ExerciseInfoPage.css";
const EXERCISE_CATEGORIES = [
  "Грудь",
  "Спина",
  "Ноги / Ягодицы",
  "Дельты",
  "Руки",
  "Пресс",
  "Кардио",
  "Йога",
];

const EXERCISE_MUSCLES = [
  "Предплечье",
  "Бицепс",
  "Плечевая мышца",
  "Трицепс",
  "Средние дельты",
  "Задние дельты",
  "Передние дельты",
  "Трапециевидные",
  "Верх / центр спины",
  "Широчайшие",
  "Пресс",
  "Косые мышцы",
  "Середина / низ грудных",
  "Верх грудных",
  "Ягодицы",
  "Верх ягодиц",
  "Хамстринги",
  "Квадрицепс",
  "Икроножные",
  "Камбаловидные",
  "Поясница",
  "Приводящие",
];

export default function ExerciseInfoPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrimaryMuscles, setEditPrimaryMuscles] = useState([]);
  const [editSecondaryMuscles, setEditSecondaryMuscles] = useState([]);
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadExercise = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getExerciseById(id);

        if (!isMounted) {
          return;
        }

        setExercise(data);

        setEditName(data?.name || "");
        setEditCategory(data?.category || "");
        setEditPrimaryMuscles(
          Array.isArray(data?.primary_muscles) ? data.primary_muscles : [],
        );
        setEditSecondaryMuscles(
          Array.isArray(data?.secondary_muscles) ? data.secondary_muscles : [],
        );
        setEditDescription(data?.description || "");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Ошибка загрузки упражнения:", error);
        setError(error.message || "Не удалось загрузить упражнение.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadExercise();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleClose = () => {
    navigate(-1);
  };

  const handleStartEditing = () => {
    setSaveError("");

    setEditName(exercise?.name || "");
    setEditCategory(exercise?.category || "");
    setEditPrimaryMuscles(
      Array.isArray(exercise?.primary_muscles) ? exercise.primary_muscles : [],
    );
    setEditSecondaryMuscles(
      Array.isArray(exercise?.secondary_muscles)
        ? exercise.secondary_muscles
        : [],
    );
    setEditDescription(exercise?.description || "");

    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setSaveError("");

    setEditName(exercise?.name || "");
    setEditCategory(exercise?.category || "");
    setEditPrimaryMuscles(
      Array.isArray(exercise?.primary_muscles) ? exercise.primary_muscles : [],
    );
    setEditSecondaryMuscles(
      Array.isArray(exercise?.secondary_muscles)
        ? exercise.secondary_muscles
        : [],
    );
    setEditDescription(exercise?.description || "");

    setIsEditing(false);
  };
  const toggleMuscle = (muscle, setter) => {
    setter((current) =>
      current.includes(muscle)
        ? current.filter((item) => item !== muscle)
        : [...current, muscle],
    );
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!exercise?.can_edit) {
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      const updatedExercise = await updateExercise({
        exerciseId: exercise.id,
        name: editName,
        category: editCategory,
        primaryMuscles: editPrimaryMuscles,
        secondaryMuscles: editSecondaryMuscles,
        description: editDescription,
      });

      setExercise({
        ...updatedExercise,
        can_edit: true,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Ошибка сохранения упражнения:", error);
      setSaveError(error.message || "Не удалось сохранить изменения.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="training-view">
        <div className="exercise-info-page">
          <div className="exercise-info-page__loading">
            Загрузка упражнения...
          </div>
        </div>
      </main>
    );
  }

  if (error || !exercise) {
    return (
      <main className="training-view">
        <div className="exercise-info-page">
          <div className="exercise-info-page__error">
            {error || "Упражнение не найдено."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="training-view">
      <div className="exercise-info-page">
        <div className="exercise-info-page__scroll">
          <header className="exercise-info-page__header">
            <h1 className="exercise-info-page__title">
              {isEditing ? "Редактирование упражнения" : exercise.name}
            </h1>

            <button
              type="button"
              className="exercise-info-page__close"
              onClick={handleClose}
              aria-label="Закрыть"
            >
              ×
            </button>
          </header>

          {!isEditing && (
            <>
              <div
                className="exercise-info-page__video"
                aria-label="Видео упражнения"
              />

              <section className="exercise-info-page__section">
                <h2 className="exercise-info-page__section-title">Категория</h2>

                {exercise.category && (
                  <div className="exercise-info-page__chips">
                    <span className="exercise-info-page__chip exercise-info-page__chip--selected">
                      {exercise.category}
                    </span>
                  </div>
                )}
              </section>

              <section className="exercise-info-page__section">
                <h2 className="exercise-info-page__section-title">
                  Основные мышцы
                </h2>

                <div className="exercise-info-page__chips">
                  {Array.isArray(exercise.primary_muscles) &&
                    exercise.primary_muscles.map((muscle) => (
                      <span
                        key={muscle}
                        className="exercise-info-page__chip exercise-info-page__chip--selected"
                      >
                        {muscle}
                      </span>
                    ))}
                </div>
              </section>

              <section className="exercise-info-page__section">
                <h2 className="exercise-info-page__section-title">
                  Дополнительные мышцы
                </h2>

                <div className="exercise-info-page__chips">
                  {Array.isArray(exercise.secondary_muscles) &&
                    exercise.secondary_muscles.map((muscle) => (
                      <span
                        key={muscle}
                        className="exercise-info-page__chip exercise-info-page__chip--selected"
                      >
                        {muscle}
                      </span>
                    ))}
                </div>
              </section>

              <section className="exercise-info-page__section">
                <h2 className="exercise-info-page__section-title">Описание</h2>

                <div className="exercise-info-page__description">
                  {exercise.description || "Описание пока не добавлено."}
                </div>
              </section>

              {exercise.can_edit && (
                <button
                  type="button"
                  className="exercise-info-page__edit"
                  onClick={handleStartEditing}
                >
                  Редактировать
                </button>
              )}

              <button
                type="button"
                className="exercise-info-page__progress"
                onClick={() => {}}
              >
                Прогресс
              </button>
            </>
          )}

          {isEditing && (
            <form
              className="exercise-info-page__edit-form"
              onSubmit={handleSave}
            >
              <label className="exercise-info-page__field">
                <span>Название</span>

                <input
                  type="text"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  disabled={isSaving}
                />
              </label>

              <div className="exercise-info-page__field">
                <span>Категория</span>

                <div className="exercise-info-page__chips">
                  {EXERCISE_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={`exercise-info-page__chip ${
                        editCategory === category
                          ? "exercise-info-page__chip--selected"
                          : ""
                      }`}
                      onClick={() => setEditCategory(category)}
                      disabled={isSaving}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="exercise-info-page__field">
                <span>Основные мышцы</span>

                <div className="exercise-info-page__chips">
                  {EXERCISE_MUSCLES.map((muscle) => (
                    <button
                      key={muscle}
                      type="button"
                      className={`exercise-info-page__chip ${
                        editPrimaryMuscles.includes(muscle)
                          ? "exercise-info-page__chip--selected"
                          : ""
                      }`}
                      onClick={() =>
                        toggleMuscle(muscle, setEditPrimaryMuscles)
                      }
                      disabled={isSaving}
                    >
                      {muscle}
                    </button>
                  ))}
                </div>
              </div>

              <div className="exercise-info-page__field">
                <span>Дополнительные мышцы</span>

                <div className="exercise-info-page__chips">
                  {EXERCISE_MUSCLES.map((muscle) => (
                    <button
                      key={muscle}
                      type="button"
                      className={`exercise-info-page__chip ${
                        editSecondaryMuscles.includes(muscle)
                          ? "exercise-info-page__chip--selected"
                          : ""
                      }`}
                      onClick={() =>
                        toggleMuscle(muscle, setEditSecondaryMuscles)
                      }
                      disabled={isSaving}
                    >
                      {muscle}
                    </button>
                  ))}
                </div>
              </div>

              <label className="exercise-info-page__field">
                <span>Описание</span>

                <textarea
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  rows={7}
                  disabled={isSaving}
                />
              </label>

              <div className="exercise-info-page__field">
                <span>
                  Вставьте ссылку на видео или прикрепите свое видео/фото
                </span>

                <div className="exercise-info-page__media-input">
                  <input
                    type="url"
                    placeholder="Ссылка на видео"
                    disabled={isSaving}
                  />

                  <button
                    type="button"
                    className="exercise-info-page__media-add"
                    disabled={isSaving}
                    aria-label="Прикрепить видео или фото"
                  >
                    +
                  </button>
                </div>
              </div>

              {saveError && (
                <div className="exercise-info-page__save-error">
                  {saveError}
                </div>
              )}

              <div className="exercise-info-page__edit-actions">
                <button
                  type="button"
                  className="exercise-info-page__cancel"
                  onClick={handleCancelEditing}
                  disabled={isSaving}
                >
                  Отмена
                </button>

                <button
                  type="submit"
                  className="exercise-info-page__save"
                  disabled={isSaving}
                >
                  {isSaving ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
