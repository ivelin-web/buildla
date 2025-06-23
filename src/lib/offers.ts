import { Offer } from '@/types';

// In-memory storage for offers (simulating database)
const OFFERS_DATA: Offer[] = [
  {
    id: '1',
    taskId: 'bathroom',
    taskName: 'Badrumsrenovering',
    customerInfo: {
      name: 'Anna Andersson',
      email: 'anna@example.com',
      phone: '+46701234567'
    },
    offerDetails: {
      area: 6,
      laborCost: 166000,
      materialCost: 54000,
      transportCost: 3584,
      parkingCost: 1280,
      rotDeduction: 83000,
      totalIncVat: 177080,
      features: ['Före 1950', 'Icke-standard kakel', 'Standard form', '2 inbyggda detaljer']
    },
    chatHistory: [
      { role: 'user', content: 'Hej, jag behöver offert för badrumsrenovering' },
      { role: 'assistant', content: 'Hej! Jag är Buildla Offertassistent...' }
    ],
    createdAt: '2024-01-15T10:30:00Z',
    status: 'completed'
  },
  {
    id: '2',
    taskId: 'bathroom',
    taskName: 'Badrumsrenovering',
    customerInfo: {
      name: 'Erik Eriksson',
      email: 'erik@example.com',
      phone: '+46709876543'
    },
    offerDetails: {
      area: 4,
      laborCost: 134000,
      materialCost: 46000,
      transportCost: 2896,
      parkingCost: 1024,
      rotDeduction: 67000,
      totalIncVat: 146150,
      features: ['Modern fastighet', 'Standard kakel', 'Standard form', '1 inbyggd detalj']
    },
    chatHistory: [
      { role: 'user', content: 'Vad kostar det att renovera ett badrum?' },
      { role: 'assistant', content: 'Hej! Jag hjälper dig gärna...' }
    ],
    createdAt: '2024-01-14T14:20:00Z',
    status: 'completed'
  }
];

export function getOffersData(): Offer[] {
  return OFFERS_DATA;
}

export function addOffer(offer: Omit<Offer, 'id' | 'createdAt'>): Offer {
  const newOffer: Offer = {
    ...offer,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  
  OFFERS_DATA.push(newOffer);
  return newOffer;
}

export function deleteOffer(id: string): boolean {
  const index = OFFERS_DATA.findIndex(offer => offer.id === id);
  if (index === -1) return false;
  
  OFFERS_DATA.splice(index, 1);
  return true;
}

export function filterOffers(filters: {
  taskId?: string;
  status?: string;
  search?: string;
}): Offer[] {
  let offers = [...OFFERS_DATA];

  if (filters.taskId) {
    offers = offers.filter(offer => offer.taskId === filters.taskId);
  }

  if (filters.status) {
    offers = offers.filter(offer => offer.status === filters.status);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    offers = offers.filter(offer => 
      offer.customerInfo.name.toLowerCase().includes(searchLower) ||
      offer.customerInfo.email.toLowerCase().includes(searchLower) ||
      offer.customerInfo.phone.includes(filters.search!)
    );
  }

  return offers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
} 