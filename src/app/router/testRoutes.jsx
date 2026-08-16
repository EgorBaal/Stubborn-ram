import AppLayoutV2 from "@/app/layouts/AppLayoutV2";
import AuthTestPage from "@/pages/AuthTestPage";

const testRoutes = [
  {
    element: <AppLayoutV2 />,
    children: [
      {
        path: "/test",
        element: <AuthTestPage />,
      },
    ],
  },
];

export default testRoutes;
