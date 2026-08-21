import AppLayout from "@/app/layouts/AppLayout";
import AuthGuard from "@/app/router/guards/AuthGuard";

import HomePage from "@/modules/home/HomePage";
import LibraryPage from "@/modules/library/LibraryPage";
import ChatPage from "@/modules/chat/ChatPage";
import AnalyticsPage from "@/modules/analytics/AnalyticsPage";
import ProfilePage from "@/modules/profile/ProfilePage";
import TrainingHistoryPage from "@/modules/training/screens/TrainingHistoryPage";
import TrainingTemplatesPage from "@/modules/training/screens/TrainingTemplatesPage";
import TrainingExercisesPage from "@/modules/training/screens/TrainingExercisesPage";
import TrainingBuilderPage from "@/modules/training/screens/TrainingBuilderPage";
import TrainingTemplateBuilderPage from "@/modules/training/screens/TrainingTemplateBuilderPage";
import TrainingExerciseBuilderPage from "@/modules/training/screens/TrainingExerciseBuilderPage";
import TrainingProgramsPage from "@/modules/training/screens/TrainingProgramsPage";
import CommentsPage from "@/modules/comments/CommentsPage";

import ReportPlaceholderPage from "@/modules/report/ReportPlaceholderPage";
import ActivityPlaceholderPage from "@/modules/activity/ActivityPlaceholderPage";
import NutritionPlaceholderPage from "@/modules/nutrition/NutritionPlaceholderPage";
import PhotosPlaceholderPage from "@/modules/photos/PhotosPlaceholderPage";
import WeightPlaceholderPage from "@/modules/weight/WeightPlaceholderPage";

const appRoutes = [
  {
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),

    children: [
      { path: "/app/home", element: <HomePage /> },
      { path: "/app/library", element: <LibraryPage /> },
      { path: "/app/chat", element: <ChatPage /> },
      { path: "/app/analytics", element: <AnalyticsPage /> },
      { path: "/app/profile", element: <ProfilePage /> },

      { path: "/app/comments", element: <CommentsPage /> },
      { path: "/app/report", element: <ReportPlaceholderPage /> },
      { path: "/app/activity", element: <ActivityPlaceholderPage /> },
      { path: "/app/training", element: <TrainingHistoryPage /> },
      { path: "/app/training/templates", element: <TrainingTemplatesPage /> },
      { path: "/app/training/exercises", element: <TrainingExercisesPage /> },
      { path: "/app/training/create", element: <TrainingBuilderPage /> },
      {
        path: "/app/training/templates/create",
        element: <TrainingTemplateBuilderPage />,
      },
      {
        path: "/app/training/exercises/create",
        element: <TrainingExerciseBuilderPage />,
      },
      { path: "/app/training/programs", element: <TrainingProgramsPage /> },
      { path: "/app/nutrition", element: <NutritionPlaceholderPage /> },
      { path: "/app/photos", element: <PhotosPlaceholderPage /> },
      { path: "/app/weight", element: <WeightPlaceholderPage /> },
      { path: "/app/activity-module", element: <ActivityPlaceholderPage /> },
      { path: "/app/report-module", element: <ReportPlaceholderPage /> },
    ],
  },
];

export default appRoutes;
