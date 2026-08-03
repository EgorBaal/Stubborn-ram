import BottomTabBar from "@/components/app/BottomTabBar";

import "./PagePlaceholder.css";

export default function LibraryPage() {
  return (
    <main className="app-page app-page--placeholder">
      <div>
        <h1>Library</h1>
        <p>Модуль находится в разработке.</p>
      </div>
      <BottomTabBar />
    </main>
  );
}
