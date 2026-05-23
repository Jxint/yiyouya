import { mockDestinations } from './mockDestinations';
import type { TravelRecord } from '../types';

export const mockTravels: TravelRecord[] = [
  {
    id: 'travel-demo-001',
    userId: 'user-demo-001',
    petId: 'pet-mochi',
    destination: mockDestinations[3],
    worldType: 'real',
    status: 'completed',
    travelIndex: 1,
    messages: [
      {
        id: 'msg-demo-001',
        role: 'pet',
        content: '我沿着里斯本的坡道走了一小段，风里有海盐和咖啡香。',
        createdAt: '2026-05-20T10:00:00.000Z',
      },
    ],
    diaryEntries: [
      {
        id: 'diary-demo-001',
        destinationId: mockDestinations[3].id,
        title: '在坡道上看见海',
        content: 'Mochi 坐上黄色电车，窗外的瓷砖墙一闪而过。它说这里适合把心情慢慢晒干。',
        imageUrl: '/mock-images/lisbon-1.jpg',
        createdAt: '2026-05-20T10:10:00.000Z',
      },
    ],
    intimacyDelta: 1,
    createdAt: '2026-05-20T09:50:00.000Z',
    endedAt: '2026-05-20T10:30:00.000Z',
  },
];
