import { createBrowserRouter } from "react-router-dom";

import LandingLayout from "@/layouts/LandingLayout";
import ProgramQuestionnaire from "@/pages/questionnaire/ProgramQuestionnaire";
import CoachingQuestionnaire from "@/pages/questionnaire/CoachingQuestionnaire";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <LandingLayout />,
    },

    {
      path: "/questionnaire/program",
      element: <ProgramQuestionnaire />,
    },

    {
      path: "/questionnaire/coaching",
      element: <CoachingQuestionnaire />,
    },
  ],
  {
    basename: "/Stubborn-ram",
  },
);

export default router;
