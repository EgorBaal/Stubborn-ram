import AppLayout from "@/app/layouts/AppLayout";
import AuthGuard from "@/components/auth/AuthGuard";

import HomePage from "@/modules/home/HomePage";
import LibraryPage from "@/pages/app/LibraryPage";
import ChatPage from "@/pages/app/ChatPage";
import AnalyticsPage from "@/pages/app/AnalyticsPage";
import ProfilePage from "@/modules/profile/ProfilePage";

import CommentsPlaceholderPage from "@/pages/app/CommentsPlaceholderPage";
import ReportPlaceholderPage from "@/pages/app/ReportPlaceholderPage";
import ActivityPlaceholderPage from "@/pages/app/ActivityPlaceholderPage";
import TrainingPlaceholderPage from "@/modules/training/TrainingPlaceholderPage";
import NutritionPlaceholderPage from "@/modules/nutrition/NutritionPlaceholderPage";
import PhotosPlaceholderPage from "@/pages/app/PhotosPlaceholderPage";
import WeightPlaceholderPage from "@/pages/app/WeightPlaceholderPage";

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

      { path: "/app/comments", element: <CommentsPlaceholderPage /> },
      { path: "/app/report", element: <ReportPlaceholderPage /> },
      { path: "/app/activity", element: <ActivityPlaceholderPage /> },
      { path: "/app/training", element: <TrainingPlaceholderPage /> },
      { path: "/app/nutrition", element: <NutritionPlaceholderPage /> },
      { path: "/app/photos", element: <PhotosPlaceholderPage /> },
      { path: "/app/weight", element: <WeightPlaceholderPage /> },
      { path: "/app/activity-module", element: <ActivityPlaceholderPage /> },
      { path: "/app/report-module", element: <ReportPlaceholderPage /> },
    ],
  },
];

export default appRoutes;
