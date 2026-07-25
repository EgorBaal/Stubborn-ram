import { useEffect, useRef, useState } from "react";

function Reveal({
  children,
  delay = 0,
  distance = 40,
  immediate = false,
}) {

  const ref = useRef(null);

  const [visible, setVisible] = useState(false);

  useEffect(() => {

    const element = ref.current;

    if (!element) return;


    if (immediate) {

      const timer = setTimeout(() => {

        setVisible(true);

      }, delay);

      return () => clearTimeout(timer);

    }


    const observer = new IntersectionObserver(
      ([entry]) => {

        if (entry.isIntersecting) {

          setVisible(true);

          observer.unobserve(element);

        }

      },
      {
        threshold: 0.01,
      }
    );


    observer.observe(element);


    return () => observer.disconnect();


  }, []);


  return (

    <div

      ref={ref}

      className={`reveal ${visible ? "visible" : ""}`}

      style={{

        transitionDelay: `${delay}ms`,

        "--distance": `${distance}px`,

      }}

    >

      {children}

    </div>

  );

}

export default Reveal;