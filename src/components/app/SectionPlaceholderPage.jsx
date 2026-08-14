import PageScroll from "@/components/app/PageScroll";

export default function SectionPlaceholderPage({
  title,
  pageClassName = "placeholder-page",
}) {
  return (
    <PageScroll>
      <main className={pageClassName}>
        <div>
          <h1>{title}</h1>
          <p>Раздел находится в разработке.</p>
        </div>
      </main>
    </PageScroll>
  );
}
