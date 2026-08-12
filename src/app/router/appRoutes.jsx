import AppLayout from "@/app/layouts/AppLayout";
import AuthGuard from "@/components/auth/AuthGuard";

import HomePage from "@/modules/home/HomePage";
import LibraryPage from "@/modules/library/LibraryPage";
import ChatPage from "@/modules/chat/ChatPage";
import AnalyticsPage from "@/modules/analytics/AnalyticsPage";
import ProfilePage from "@/modules/profile/ProfilePage";

import CommentsPlaceholderPage from "@/pages/app/CommentsPlaceholderPage";
import ReportPlaceholderPage from "@/modules/report/ReportPlaceholderPage";
import ActivityPlaceholderPage from "@/modules/activity/ActivityPlaceholderPage";
import TrainingPlaceholderPage from "@/modules/training/TrainingPlaceholderPage";
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
