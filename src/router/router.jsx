import { createBrowserRouter } from "react-router-dom";

import LandingLayout from "@/layouts/LandingLayout";
import ActivityPlaceholderPage from "@/pages/app/ActivityPlaceholderPage";
import AnalyticsPage from "@/pages/app/AnalyticsPage";
import ChatPage from "@/pages/app/ChatPage";
import CommentsPlaceholderPage from "@/pages/app/CommentsPlaceholderPage";
import HomePage from "@/pages/app/HomePage";
import LibraryPage from "@/pages/app/LibraryPage";
import NutritionPlaceholderPage from "@/pages/app/NutritionPlaceholderPage";
import PhotosPlaceholderPage from "@/pages/app/PhotosPlaceholderPage";
import ProfilePage from "@/pages/app/ProfilePage";
import ReportPlaceholderPage from "@/pages/app/ReportPlaceholderPage";
import TrainingPlaceholderPage from "@/pages/app/TrainingPlaceholderPage";
import WeightPlaceholderPage from "@/pages/app/WeightPlaceholderPage";
import ThankYou from "@/pages/questionnaire/ThankYou";
import ProgramQuestionnaire from "@/pages/questionnaire/ProgramQuestionnaire";
import CoachingQuestionnaire from "@/pages/questionnaire/CoachingQuestionnaire";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingLayout />,
  },

  {
    path: "/app/home",
    element: <HomePage />,
  },

  {
    path: "/app/library",
    element: <LibraryPage />,
  },

  {
    path: "/app/chat",
    element: <ChatPage />,
  },

  {
    path: "/app/analytics",
    element: <AnalyticsPage />,
  },

  {
    path: "/app/profile",
    element: <ProfilePage />,
  },

  {
    path: "/app/comments",
    element: <CommentsPlaceholderPage />,
  },

  {
    path: "/app/report",
    element: <ReportPlaceholderPage />,
  },

  {
    path: "/app/activity",
    element: <ActivityPlaceholderPage />,
  },

  {
    path: "/app/training",
    element: <TrainingPlaceholderPage />,
  },

  {
    path: "/app/nutrition",
    element: <NutritionPlaceholderPage />,
  },

  {
    path: "/app/activity-module",
    element: <ActivityPlaceholderPage />,
  },

  {
    path: "/app/report-module",
    element: <ReportPlaceholderPage />,
  },

  {
    path: "/app/photos",
    element: <PhotosPlaceholderPage />,
  },

  {
    path: "/app/weight",
    element: <WeightPlaceholderPage />,
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
