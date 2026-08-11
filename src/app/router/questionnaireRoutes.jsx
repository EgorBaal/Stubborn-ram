import ProgramQuestionnaire from "@/pages/questionnaire/ProgramQuestionnaire";
import CoachingQuestionnaire from "@/pages/questionnaire/CoachingQuestionnaire";
import ThankYou from "@/pages/questionnaire/ThankYou";

const questionnaireRoutes = [
  {
    path: "/questionnaire/program",
    element: <ProgramQuestionnaire />,
  },
  {
    path: "/questionnaire/coaching",
    element: <CoachingQuestionnaire />,
  },
  {
    path: "/questionnaire/thank-you",
    element: <ThankYou />,
  },
];

export default questionnaireRoutes;