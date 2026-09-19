import { useEffect, useRef, useState } from "react";
import "./ReportPlaceholderPage.css";

const API_BASE_URL = "http://127.0.0.1:3000/api";

const MAX_PHOTOS = 30;

async function uploadMediaFile(file) {
  const uploadResponse = await fetch(`${API_BASE_URL}/media/upload`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      originalName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    }),
  });

  const uploadData = await uploadResponse.json();

  if (!uploadResponse.ok) {
    throw new Error(
      uploadData?.message || "Не удалось создать загрузку файла.",
    );
  }

  const s3Response = await fetch(uploadData.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!s3Response.ok) {
    throw new Error("Не удалось загрузить файл в Storage.");
  }

  const completeResponse = await fetch(
    `${API_BASE_URL}/media/${uploadData.media.id}/complete`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  const completeData = await completeResponse.json();

  if (!completeResponse.ok) {
    throw new Error(
      completeData?.message || "Не удалось завершить загрузку файла.",
    );
  }

  const mediaResponse = await fetch(
    `${API_BASE_URL}/media/${uploadData.media.id}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const mediaData = await mediaResponse.json();

  if (!mediaResponse.ok) {
    throw new Error(mediaData?.message || "Не удалось получить данные файла.");
  }

  return mediaData.media;
}

async function deleteMediaFile(mediaId) {
  const response = await fetch(`${API_BASE_URL}/media/${mediaId}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Не удалось удалить файл.");
  }

  return data;
}

function getSupportedAudioMimeType() {
  const types = ["audio/webm;codecs=opus", "audio/webm"];

  return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

export default function ReportPlaceholderPage() {
  const [photos, setPhotos] = useState([]);
  const [video, setVideo] = useState(null);

  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const [audioStatus, setAudioStatus] = useState("idle");
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioMedia, setAudioMedia] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);

  const [error, setError] = useState("");

  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [audioUrl]);

  function openPhotoPicker() {
    photoInputRef.current?.click();
  }

  async function handlePhotoChange(event) {
    const files = Array.from(event.target.files || []);

    event.target.value = "";

    if (!files.length) return;

    const availableSlots = MAX_PHOTOS - photos.length;

    if (availableSlots <= 0) {
      setError(`Можно прикрепить максимум ${MAX_PHOTOS} фотографий.`);
      return;
    }

    const selectedFiles = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
      setError(
        `Добавлены только ${availableSlots} фото. Максимум — ${MAX_PHOTOS}.`,
      );
    } else {
      setError("");
    }

    setIsUploadingPhotos(true);

    try {
      for (const file of selectedFiles) {
        if (!file.type.startsWith("image/")) {
          setError(`Файл "${file.name}" не является изображением.`);
          continue;
        }

        const media = await uploadMediaFile(file);

        setPhotos((current) => [...current, media]);
      }
    } catch (uploadError) {
      setError(uploadError.message || "Ошибка загрузки фотографии.");
    } finally {
      setIsUploadingPhotos(false);
    }
  }

  async function handleDeletePhoto(mediaId) {
    setError("");

    try {
      await deleteMediaFile(mediaId);

      setPhotos((current) => current.filter((photo) => photo.id !== mediaId));
    } catch (deleteError) {
      setError(deleteError.message || "Не удалось удалить фотографию.");
    }
  }

  function openVideoPicker() {
    videoInputRef.current?.click();
  }

  async function handleVideoChange(event) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Можно выбрать только видеофайл.");
      return;
    }

    setError("");
    setIsUploadingVideo(true);

    try {
      const media = await uploadMediaFile(file);
      setVideo(media);
    } catch (uploadError) {
      setError(uploadError.message || "Ошибка загрузки видео.");
    } finally {
      setIsUploadingVideo(false);
    }
  }

  async function handleDeleteVideo() {
    if (!video) return;

    setError("");

    try {
      await deleteMediaFile(video.id);
      setVideo(null);
    } catch (deleteError) {
      setError(deleteError.message || "Не удалось удалить видео.");
    }
  }

  async function startRecording() {
    setError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Браузер не поддерживает доступ к микрофону.");
      return;
    }

    const mimeType = getSupportedAudioMimeType();

    if (!mimeType) {
      setError("Браузер не поддерживает запись audio/webm.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream, {
        mimeType,
      });

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: mimeType,
        });

        setAudioBlob(blob);

        setAudioUrl((currentUrl) => {
          if (currentUrl) {
            URL.revokeObjectURL(currentUrl);
          }

          return URL.createObjectURL(blob);
        });

        setAudioStatus("recorded");

        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((track) => track.stop());

          audioStreamRef.current = null;
        }
      };

      recorder.start();

      setAudioStatus("recording");
      setAudioDuration(0);

      timerRef.current = setInterval(() => {
        setAudioDuration((current) => current + 1);
      }, 1000);
    } catch (recordingError) {
      setError(
        recordingError?.message || "Не удалось получить доступ к микрофону.",
      );
    }
  }

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  }

  function resetRecording() {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioBlob(null);
    setAudioUrl(null);
    setAudioMedia(null);
    setAudioDuration(0);
    setAudioStatus("idle");
  }

  async function uploadRecordedAudio() {
    if (!audioBlob) return;

    setError("");
    setAudioStatus("uploading");

    const file = new File([audioBlob], `voice-${Date.now()}.webm`, {
      type: audioBlob.type || "audio/webm",
    });

    try {
      const media = await uploadMediaFile(file);
      setAudioMedia(media);
      setAudioStatus("uploaded");
    } catch (uploadError) {
      setError(uploadError.message || "Ошибка загрузки голосового.");
      setAudioStatus("recorded");
    }
  }

  async function deleteAudio() {
    if (!audioMedia) {
      resetRecording();
      return;
    }

    setError("");

    try {
      await deleteMediaFile(audioMedia.id);
      resetRecording();
    } catch (deleteError) {
      setError(deleteError.message || "Не удалось удалить голосовое.");
    }
  }

  function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  }

  return (
    <main className="report-page">
      <div className="report-container">
        <h1>Отчет</h1>
        <p className="report-subtitle">Тест прикрепления файлов</p>

        {error && <div className="report-error">{error}</div>}

        <div className="report-grid">
          <section className="report-card report-card-photos">
            <div className="report-card-icon">📷</div>

            <h2>Фотографии</h2>

            {photos.length > 0 && (
              <div className="photo-grid">
                {photos.map((photo) => (
                  <div className="photo-preview" key={photo.id}>
                    <img
                      src={photo.downloadUrl}
                      alt={photo.originalName || "Фото"}
                    />

                    <button
                      type="button"
                      className="photo-delete"
                      onClick={() => handleDeletePhoto(photo.id)}
                      aria-label="Удалить фото"
                      title="Удалить"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="report-card-status">
              {isUploadingPhotos ? (
                "Загрузка..."
              ) : (
                <>
                  {photos.length} / {MAX_PHOTOS}
                </>
              )}
            </div>

            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                className="report-button"
                onClick={openPhotoPicker}
                disabled={isUploadingPhotos}
              >
                + Добавить фото
              </button>
            )}

            <input
              ref={photoInputRef}
              className="hidden-file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handlePhotoChange}
            />
          </section>

          <section className="report-card">
            <div className="report-card-icon">🎥</div>

            <h2>Видео</h2>

            {video ? (
              <>
                <video
                  className="video-preview"
                  src={video.downloadUrl}
                  controls
                />

                <div className="report-card-status success">
                  ✓ Файл загружен
                </div>

                <div className="report-file-name">{video.originalName}</div>

                <button
                  type="button"
                  className="report-button"
                  onClick={handleDeleteVideo}
                >
                  Удалить видео
                </button>
              </>
            ) : (
              <>
                <p className="report-hint">Выберите видеофайл</p>

                <button
                  type="button"
                  className="report-button"
                  onClick={openVideoPicker}
                  disabled={isUploadingVideo}
                >
                  {isUploadingVideo ? "Загрузка..." : "Загрузить видео"}
                </button>
              </>
            )}

            <input
              ref={videoInputRef}
              className="hidden-file-input"
              type="file"
              accept="video/mp4,video/webm"
              onChange={handleVideoChange}
            />
          </section>

          <section className="report-card">
            <div className="report-card-icon">🎙</div>

            <h2>Голосовое</h2>

            {audioStatus === "idle" && (
              <>
                <p className="report-hint">Нажмите, чтобы начать запись</p>

                <button
                  type="button"
                  className="report-button"
                  onClick={startRecording}
                >
                  🎙 Записать голосовое
                </button>
              </>
            )}

            {audioStatus === "recording" && (
              <>
                <div className="recording-indicator">
                  <span className="recording-dot" />
                  {formatDuration(audioDuration)}
                </div>

                <button
                  type="button"
                  className="report-button recording-button"
                  onClick={stopRecording}
                >
                  Остановить
                </button>
              </>
            )}

            {audioStatus === "recorded" && audioUrl && (
              <>
                <audio className="audio-player" src={audioUrl} controls />

                <button
                  type="button"
                  className="report-button"
                  onClick={uploadRecordedAudio}
                >
                  Загрузить голосовое
                </button>

                <button
                  type="button"
                  className="report-button secondary"
                  onClick={resetRecording}
                >
                  Перезаписать
                </button>
              </>
            )}

            {audioStatus === "uploading" && (
              <div className="report-card-status">Загрузка голосового...</div>
            )}

            {audioStatus === "uploaded" && audioMedia && (
              <>
                <audio
                  className="audio-player"
                  src={audioMedia.downloadUrl}
                  controls
                />

                <div className="report-card-status success">
                  ✓ Голосовое загружено
                </div>

                <button
                  type="button"
                  className="report-button secondary"
                  onClick={deleteAudio}
                >
                  Удалить и записать заново
                </button>
              </>
            )}
          </section>

          <section className="report-card">
            <div className="report-card-icon">💬</div>

            <h2>Комментарий</h2>

            <textarea
              className="report-comment"
              placeholder="Напишите комментарий..."
            />
          </section>
        </div>
      </div>
    </main>
  );
}
