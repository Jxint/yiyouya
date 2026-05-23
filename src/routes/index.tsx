import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { HomePage } from '../pages/Home/HomePage';
import { TravelSessionPage } from '../pages/TravelSession/TravelSessionPage';
import { TravelDetailPage } from '../pages/TravelDetail/TravelDetailPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'travel/session/:sessionId', element: <TravelSessionPage /> },
      { path: 'travel/:travelId', element: <TravelDetailPage /> },
    ],
  },
]);
