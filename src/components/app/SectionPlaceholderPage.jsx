export default function SectionPlaceholderPage({
  title,
  pageClassName = "placeholder-page",
}) {
  return (
    <main className={pageClassName}>
      <div>
        <h1>{title}</h1>
        <p>Раздел находится в разработке.</p>
      </div>
    </main>
  );
}
