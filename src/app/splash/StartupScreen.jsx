import logo from "@/assets/obshee-logo.png";

export default function StartupScreen({ isLeaving }) {
  return (
    <div
      className={`startup-screen ${isLeaving ? "startup-screen--leaving" : ""}`}
      role="presentation"
    >
      <div className="startup-screen__content">
        <img className="startup-screen__logo" src={logo} alt="Stubborn Ram" />

        <div
          className="startup-screen__title"
          aria-label="Экосистема фитнеса и бодибилдинга"
        >
          <span className="startup-screen__title-main">Экосистема</span>

          <span className="startup-screen__title-sub">
            фитнеса и бодибилдинга
          </span>
        </div>
      </div>
    </div>
  );
}
