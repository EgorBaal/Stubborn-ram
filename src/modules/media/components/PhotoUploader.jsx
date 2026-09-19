import { useEffect, useRef, useState } from "react";

import {
  uploadMediaFile,
  getMedia,
  deleteMedia,
} from "../services/mediaService";

import "./PhotoUploader.css";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;
const SWIPE_THRESHOLD = 50;

export default function PhotoUploader({ maxFiles = 30, onUploaded }) {
  const inputRef = useRef(null);
  const viewerRef = useRef(null);

  const touchState = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    pinchDistance: null,
    pinchZoom: MIN_ZOOM,
    pinchCenter: null,
  });

  const pointerState = useRef(null);

  const [items, setItems] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  function handleSelectClick() {
    inputRef.current?.click();
  }

  async function handleChange(event) {
    const selectedFiles = Array.from(event.target.files ?? []);

    event.target.value = "";

    if (!selectedFiles.length) {
      return;
    }

    const imageFiles = selectedFiles.filter((file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    );

    if (!imageFiles.length) {
      setError("Можно выбрать только изображения JPG, PNG или WebP.");
      return;
    }

    const availableSlots = Math.max(maxFiles - items.length, 0);
    const filesToUpload = imageFiles.slice(0, availableSlots);

    if (!filesToUpload.length) {
      setError(`Можно добавить максимум ${maxFiles} фотографий.`);
      return;
    }

    setError("");
    setIsUploading(true);

    const uploadedItems = [];

    try {
      for (const file of filesToUpload) {
        const result = await uploadMediaFile(file);

        if (result.error) {
          setError(result.error.message || "Не удалось загрузить фотографию.");
          break;
        }

        const media = result.data?.media;

        if (!media?.id) {
          setError("Сервер не вернул данные загруженной фотографии.");
          break;
        }

        const mediaResult = await getMedia(media.id);

        if (mediaResult.error) {
          setError(
            mediaResult.error.message ||
              "Не удалось получить загруженную фотографию.",
          );
          break;
        }

        const loadedMedia = mediaResult.data?.media;

        if (!loadedMedia?.downloadUrl) {
          setError("Сервер не вернул ссылку на фотографию.");
          break;
        }

        uploadedItems.push({
          id: loadedMedia.id,
          name: loadedMedia.originalName || file.name,
          mimeType: loadedMedia.mimeType || file.type,
          downloadUrl: loadedMedia.downloadUrl,
        });
      }

      if (uploadedItems.length) {
        setItems((current) => {
          const next = [...current, ...uploadedItems];
          onUploaded?.(next);
          return next;
        });
      }
    } finally {
      setIsUploading(false);
    }
  }

  function resetViewerTransform() {
    setZoom(MIN_ZOOM);
    setPosition({
      x: 0,
      y: 0,
    });
  }

  function handleOpenViewer(index) {
    setSelectedIndex(index);
    resetViewerTransform();
  }

  function handleCloseViewer() {
    setSelectedIndex(null);
    resetViewerTransform();
  }

  async function handleDeleteSelected() {
    if (!selectedItem) {
      return;
    }

    const result = await deleteMedia(selectedItem.id);

    if (result.error) {
      setError(result.error.message || "Не удалось удалить фотографию.");
      return;
    }

    setItems((current) => {
      const next = current.filter((item) => item.id !== selectedItem.id);
      onUploaded?.(next);
      return next;
    });

    if (items.length <= 1) {
      handleCloseViewer();
      return;
    }

    setSelectedIndex((current) => {
      if (current === null) {
        return null;
      }

      if (current >= items.length - 1) {
        return current - 1;
      }

      return current;
    });

    resetViewerTransform();
  }

  function handlePrevious() {
    setSelectedIndex((current) => {
      if (current === null || current <= 0) {
        return current;
      }

      resetViewerTransform();
      return current - 1;
    });
  }

  function handleNext() {
    setSelectedIndex((current) => {
      if (current === null || current >= items.length - 1) {
        return current;
      }

      resetViewerTransform();
      return current + 1;
    });
  }

  function handleViewerKeyDown(event) {
    if (event.key === "Escape") {
      handleCloseViewer();
      return;
    }

    if (zoom !== MIN_ZOOM) {
      return;
    }

    if (event.key === "ArrowLeft") {
      handlePrevious();
    }

    if (event.key === "ArrowRight") {
      handleNext();
    }
  }

  function getTouchDistance(touches) {
    if (touches.length < 2) {
      return 0;
    }

    const first = touches[0];
    const second = touches[1];

    return Math.hypot(
      second.clientX - first.clientX,
      second.clientY - first.clientY,
    );
  }

  function getTouchCenter(touches) {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  }

  function getViewerCenter() {
    const rect = viewerRef.current?.getBoundingClientRect();

    if (!rect) {
      return {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };
    }

    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  function zoomAroundPoint(nextZoom, clientX, clientY) {
    const clampedZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));

    if (clampedZoom === MIN_ZOOM) {
      setZoom(MIN_ZOOM);
      setPosition({
        x: 0,
        y: 0,
      });
      return;
    }

    setPosition((current) => {
      const viewerCenter = getViewerCenter();

      const pointX = clientX - viewerCenter.x;
      const pointY = clientY - viewerCenter.y;

      const oldScale = zoom;
      const scaleRatio = clampedZoom / oldScale;

      return {
        x: pointX - (pointX - current.x) * scaleRatio,
        y: pointY - (pointY - current.y) * scaleRatio,
      };
    });

    setZoom(clampedZoom);
  }

  function handleTouchStart(event) {
    if (event.touches.length >= 2) {
      event.preventDefault();

      const distance = getTouchDistance(event.touches);
      const center = getTouchCenter(event.touches);

      touchState.current.pinchDistance = distance;
      touchState.current.pinchZoom = zoom;
      touchState.current.pinchCenter = center;

      return;
    }

    const touch = event.touches[0];

    touchState.current.startX = touch.clientX;
    touchState.current.startY = touch.clientY;
    touchState.current.startTime = Date.now();
  }

  function handleTouchMove(event) {
    if (event.touches.length >= 2) {
      event.preventDefault();

      const distance = getTouchDistance(event.touches);
      const center = getTouchCenter(event.touches);

      if (!touchState.current.pinchDistance || !distance) {
        return;
      }

      const scale = distance / touchState.current.pinchDistance;

      const nextZoom = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, touchState.current.pinchZoom * scale),
      );

      const previousCenter = touchState.current.pinchCenter;

      const viewerCenter = getViewerCenter();

      const centerDeltaX = center.x - previousCenter.x;
      const centerDeltaY = center.y - previousCenter.y;

      setPosition((current) => {
        const pointX = previousCenter.x - viewerCenter.x;
        const pointY = previousCenter.y - viewerCenter.y;

        const scaleRatio = nextZoom / touchState.current.pinchZoom;

        return {
          x: pointX - (pointX - current.x) * scaleRatio + centerDeltaX,
          y: pointY - (pointY - current.y) * scaleRatio + centerDeltaY,
        };
      });

      setZoom(nextZoom);

      touchState.current.pinchCenter = center;

      return;
    }

    if (zoom > MIN_ZOOM) {
      event.preventDefault();

      const touch = event.touches[0];

      const deltaX = touch.clientX - touchState.current.startX;
      const deltaY = touch.clientY - touchState.current.startY;

      setPosition((current) => ({
        x: current.x + deltaX,
        y: current.y + deltaY,
      }));

      touchState.current.startX = touch.clientX;
      touchState.current.startY = touch.clientY;
    }
  }

  function handleTouchEnd(event) {
    if (touchState.current.pinchDistance !== null) {
      if (event.touches.length < 2) {
        touchState.current.pinchDistance = null;
        touchState.current.pinchCenter = null;
      }

      return;
    }

    if (zoom > MIN_ZOOM) {
      return;
    }

    const touch = event.changedTouches[0];

    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;

    const elapsed = Date.now() - touchState.current.startTime;

    if (
      Math.abs(deltaX) >= SWIPE_THRESHOLD &&
      Math.abs(deltaX) > Math.abs(deltaY) &&
      elapsed < 700
    ) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
  }

  function handlePointerDown(event) {
    if (zoom <= MIN_ZOOM) {
      return;
    }

    if (event.pointerType === "touch") {
      return;
    }

    pointerState.current = {
      x: event.clientX,
      y: event.clientY,
    };

    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!pointerState.current || zoom <= MIN_ZOOM) {
      return;
    }

    const deltaX = event.clientX - pointerState.current.x;
    const deltaY = event.clientY - pointerState.current.y;

    setPosition((current) => ({
      x: current.x + deltaX,
      y: current.y + deltaY,
    }));

    pointerState.current = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  function handlePointerUp() {
    pointerState.current = null;
  }

  function handleWheel(event) {
    event.preventDefault();

    const direction = event.deltaY < 0 ? 1 : -1;

    const nextZoom = zoom + direction * ZOOM_STEP;

    zoomAroundPoint(nextZoom, event.clientX, event.clientY);
  }

  useEffect(() => {
    if (selectedIndex === null) {
      return undefined;
    }

    viewerRef.current?.focus();

    return undefined;
  }, [selectedIndex]);

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

  return (
    <div className="photo-uploader">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={handleChange}
      />

      <button
        className="photo-uploader__button"
        type="button"
        onClick={handleSelectClick}
        disabled={isUploading || items.length >= maxFiles}
      >
        {isUploading ? "Загрузка..." : "Добавить фотографии"}
      </button>

      {error ? <div className="photo-uploader__error">{error}</div> : null}

      {items.length ? (
        <div className="photo-uploader__grid">
          {items.map((item, index) => (
            <button
              className="photo-uploader__item"
              key={item.id}
              type="button"
              onClick={() => handleOpenViewer(index)}
              aria-label={`Открыть ${item.name}`}
            >
              <img
                className="photo-uploader__image"
                src={item.downloadUrl}
                alt={item.name}
              />
            </button>
          ))}
        </div>
      ) : null}

      {selectedItem ? (
        <div
          ref={viewerRef}
          className="photo-uploader__viewer"
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр фотографии"
          tabIndex={-1}
          onKeyDown={handleViewerKeyDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          onClick={handleCloseViewer}
        >
          <button
            className="photo-uploader__viewer-close"
            type="button"
            onClick={handleCloseViewer}
            aria-label="Закрыть"
          >
            ×
          </button>

          <button
            className="photo-uploader__viewer-delete"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleDeleteSelected();
            }}
            aria-label="Удалить фотографию"
          >
            Удалить
          </button>

          {selectedIndex > 0 ? (
            <button
              className="photo-uploader__viewer-nav photo-uploader__viewer-nav--previous"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handlePrevious();
              }}
              aria-label="Предыдущая фотография"
            >
              ‹
            </button>
          ) : null}

          <div className="photo-uploader__viewer-stage">
            <img
              className="photo-uploader__viewer-image"
              src={selectedItem.downloadUrl}
              alt={selectedItem.name}
              draggable="false"
              style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${zoom})`,
              }}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
          </div>

          {selectedIndex < items.length - 1 ? (
            <button
              className="photo-uploader__viewer-nav photo-uploader__viewer-nav--next"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleNext();
              }}
              aria-label="Следующая фотография"
            >
              ›
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
