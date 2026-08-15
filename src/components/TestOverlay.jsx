export default function TestOverlay() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "red",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "40px",
        fontWeight: "bold",
      }}
    >
      TEST
    </div>
  );
}
