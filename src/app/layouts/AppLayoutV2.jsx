import { Outlet } from "react-router-dom";

import "./AppLayoutV2.css";

export default function AppLayoutV2() {
  return (
    <div className="app-v2">
      <div className="page-v2">
        <Outlet />
      </div>
    </div>
  );
}
