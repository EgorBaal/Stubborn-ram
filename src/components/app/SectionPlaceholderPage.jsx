import BottomTabBar from "@/components/app/BottomTabBar";

import "@/pages/app/PagePlaceholder.css";

export default function SectionPlaceholderPage({ title }) {
  return (
    <main className="app-page app-page--placeholder">
      <div>
        <h1>{title}</h1>
        <p>Раздел находится в разработке.</p>
      </div>
      <BottomTabBar />
    </main>
  );
}
