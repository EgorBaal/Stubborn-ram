export default function TrainingComment() {
  return (
    <div className="training-comment">
      <h2 className="training-comment__title">Комментарий к тренировке</h2>

      <textarea
        className="training-comment__field"
        placeholder="Введите комментарий..."
      />
    </div>
  );
}
