import { createBrowserRouter } from "react-router-dom";

import LandingLayout from "@/layouts/LandingLayout";
import AppLayout from "@/layouts/AppLayout";

import HomePage from "@/pages/app/HomePage";
import LibraryPage from "@/pages/app/LibraryPage";
import ChatPage from "@/pages/app/ChatPage";
import AnalyticsPage from "@/pages/app/AnalyticsPage";
import ProfilePage from "@/pages/app/ProfilePage";

import CommentsPlaceholderPage from "@/pages/app/CommentsPlaceholderPage";
import ReportPlaceholderPage from "@/pages/app/ReportPlaceholderPage";
import ActivityPlaceholderPage from "@/pages/app/ActivityPlaceholderPage";
import TrainingPlaceholderPage from "@/pages/app/TrainingPlaceholderPage";
import NutritionPlaceholderPage from "@/pages/app/NutritionPlaceholderPage";
import PhotosPlaceholderPage from "@/pages/app/PhotosPlaceholderPage";
import WeightPlaceholderPage from "@/pages/app/WeightPlaceholderPage";

import ProgramQuestionnaire from "@/pages/questionnaire/ProgramQuestionnaire";
import CoachingQuestionnaire from "@/pages/questionnaire/CoachingQuestionnaire";
import ThankYou from "@/pages/questionnaire/ThankYou";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingLayout />,
  },

  {
    path: "/app",
    element: <AppLayout />,
    children: [
      {
        path: "home",
        element: <HomePage />,
      },
      {
        path: "library",
        element: <LibraryPage />,
      },
      {
        path: "chat",
        element: <ChatPage />,
      },
      {
        path: "analytics",
        element: <AnalyticsPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "comments",
        element: <CommentsPlaceholderPage />,
      },
      {
        path: "report",
        element: <ReportPlaceholderPage />,
      },
      {
        path: "activity",
        element: <ActivityPlaceholderPage />,
      },
      {
        path: "training",
        element: <TrainingPlaceholderPage />,
      },
      {
        path: "nutrition",
        element: <NutritionPlaceholderPage />,
      },
      {
        path: "activity-module",
        element: <ActivityPlaceholderPage />,
      },
      {
        path: "report-module",
        element: <ReportPlaceholderPage />,
      },
      {
        path: "photos",
        element: <PhotosPlaceholderPage />,
      },
      {
        path: "weight",
        element: <WeightPlaceholderPage />,
      },
    ],
  },

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
]);

export default router;