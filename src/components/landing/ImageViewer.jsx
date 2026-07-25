import { useState } from "react";

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

import "yet-another-react-lightbox/styles.css";

function ImageViewer({ images, index, onClose }) {
  return (
    <Lightbox
      key={index}
      open={index !== null}
      close={onClose}
      index={index ?? 0}
      slides={images}
      plugins={[Zoom]}
      controller={{
        closeOnBackdropClick: true,
      }}
      carousel={{
        finite: false,
      }}
      zoom={{
        maxZoomPixelRatio: 4,
        scrollToZoom: true,
      }}
      render={{
        buttonZoom: () => null,
        buttonPrev: () => null,
        buttonNext: () => null,
        buttonClose: () => null,
      }}
    />
  );
}

export default ImageViewer;
