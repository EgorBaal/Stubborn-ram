import "./PhotosPlaceholderPage.css";

import PhotoUploader from "../media/components/PhotoUploader";

export default function PhotosPlaceholderPage() {
  return (
    <main className="photos-page">
      <div>
        <h1>Фото и замеры</h1>
        <p>Тест загрузки фотографий через Media API.</p>

        <PhotoUploader />
      </div>
    </main>
  );
}
