import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import "./SupportCarousel.css";
import supportSlides from "../../data/supportSlides";
import ImageViewer from "./ImageViewer";

function SupportCarousel() {
  const [currentIndex, setCurrentIndex] = useState(null);

  // Массив изображений для Lightbox
  const images = supportSlides
    .filter((slide) => slide.type === "image" && slide.src)
    .map((slide) => ({
      src: slide.src,
      title: slide.title,
    }));

  return (
    <section className="supportCarousel">
      <Swiper
        modules={[Pagination]}
        slidesPerView={1}
        spaceBetween={30}
        speed={450}
        grabCursor={true}
        pagination={{
          clickable: true,
        }}
        onSlideChange={() => {
          document.querySelectorAll("video").forEach((video) => {
            video.pause();
            video.currentTime = 0;
          });
        }}
      >
        {supportSlides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="supportCard">
              {slide.type === "image" && slide.src ? (
                <div className="supportImage">
                  <img
                    src={slide.src}
                    alt={slide.title}
                    className="supportMedia"
                    onClick={() =>
                      setCurrentIndex(
                        images.findIndex((image) => image.src === slide.src),
                      )
                    }
                    style={{ cursor: "zoom-in" }}
                  />
                </div>
              ) : slide.type === "video" && slide.src ? (
                <div className="supportVideo">
                  <video
                    className="supportMediaVideo"
                    controls
                    preload="metadata"
                  >
                    <source src={slide.src} type="video/mp4" />
                    Ваш браузер не поддерживает видео.
                  </video>
                </div>
              ) : (
                <div className="supportImage">
                  <div className="supportPlaceholder">Раздел в разработке</div>
                </div>
              )}

              <div className="supportContent">
                <h3 className="supportTitle">{slide.title}</h3>

                <p className="supportDescription">{slide.description}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <ImageViewer
        images={images}
        index={currentIndex}
        onClose={() => setCurrentIndex(null)}
      />
    </section>
  );
}

export default SupportCarousel;
