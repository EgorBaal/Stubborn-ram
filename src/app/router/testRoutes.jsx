import AppLayoutV2 from "@/app/layouts/AppLayoutV2";
import TestPage from "@/pages/TestPage";

const testRoutes = [
  {
    element: <AppLayoutV2 />,
    children: [
      {
        path: "/test",
        element: <TestPage />,
      },
    ],
  },
];

export default testRoutes;
