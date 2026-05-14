export type Sector = string;

export interface CustomSector {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Item {
  id: string;
  name: string;
  sectorId: Sector;
  currentStock: number;
  minStock: number;
  idealStock: number;
  unit: string;
  icon?: string;
  packageType?: string;
  packageWeight?: number;
  imageUrl?: string;
  updatedAt: any; // Firestore Timestamp
  lastUpdatedBy: string;
}

export interface StockLog {
  id: string;
  itemId: string;
  itemName: string;
  userName: string;
  userId: string;
  sectorId?: string;
  type: 'increase' | 'decrease' | 'replenish' | 'set';
  amount: number;
  price?: number;
  unit?: string;
  timestamp: any; // Firestore Timestamp
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'chef';
  sectorId?: Sector;
  approved: boolean;
  allowedSectors: Sector[];
}
