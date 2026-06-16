import { collection, doc, writeBatch, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Item } from '../types';

const INITIAL_ITEMS: Partial<Item>[] = [
  // CHAPA
  { name: 'Bifes', sectorId: 'chapa', currentStock: 24, minStock: 40, idealStock: 80, unit: 'un', imageUrl: 'https://images.unsplash.com/photo-1606416132922-22ab37c1231e?w=400&auto=format&fit=crop&q=60' },
  { name: 'Pães', sectorId: 'chapa', currentStock: 156, minStock: 100, idealStock: 200, unit: 'un', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=60' },
  { name: 'Bacon', sectorId: 'chapa', currentStock: 8, minStock: 20, idealStock: 50, unit: 'un', imageUrl: 'https://images.unsplash.com/photo-1551106602-a434ff87e912?w=400&auto=format&fit=crop&q=60' },
  { name: 'Queijo', sectorId: 'chapa', currentStock: 42, minStock: 30, idealStock: 60, unit: 'un', imageUrl: 'https://images.unsplash.com/photo-1486297678162-ad2a19b05840?w=400&auto=format&fit=crop&q=60' },
  
  // PORÇÕES
  { name: 'Batata Frita', sectorId: 'porcoes', currentStock: 15, minStock: 20, idealStock: 40, unit: 'pacote', packageType: 'Saco', packageWeight: 10.5, imageUrl: 'https://images.unsplash.com/photo-1518013431117-eb1465fd5752?w=400&auto=format&fit=crop&q=60' },
  { name: 'Onion Rings', sectorId: 'porcoes', currentStock: 3, minStock: 10, idealStock: 20, unit: 'pacote', imageUrl: 'https://images.unsplash.com/photo-1639024471283-035188835118?w=400&auto=format&fit=crop&q=60' },
  { name: 'Nuggets', sectorId: 'porcoes', currentStock: 22, minStock: 15, idealStock: 30, unit: 'pacote', imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&auto=format&fit=crop&q=60' },

  // BEBIDAS
  { name: 'Gelo', sectorId: 'bebidas', currentStock: 5, minStock: 20, idealStock: 40, unit: 'saco', imageUrl: 'https://images.unsplash.com/photo-1525286335722-c30c6b5df541?w=400&auto=format&fit=crop&q=60' },
  { name: 'Sorvete', sectorId: 'bebidas', currentStock: 12, minStock: 10, idealStock: 20, unit: 'un', imageUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&auto=format&fit=crop&q=60' },
  { name: 'Cola Classic', sectorId: 'bebidas', currentStock: 144, minStock: 72, idealStock: 288, unit: 'un', imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=60' },
  { name: 'Cola Zero', sectorId: 'bebidas', currentStock: 96, minStock: 48, idealStock: 192, unit: 'un' },
  { name: 'Soda Limão', sectorId: 'bebidas', currentStock: 0, minStock: 24, idealStock: 96, unit: 'un' }
];

const INITIAL_SECTORS = [
  { id: 'chapa', name: 'Chapa', description: 'Zona de processamento térmico', icon: 'local_fire_department' },
  { id: 'porcoes', name: 'Porções', description: 'Área de fritura e preparo de porções', icon: 'tapas' },
  { id: 'bebidas', name: 'Bebidas', description: 'Estoque refrigerado de bebidas', icon: 'water_drop' }
];

export async function seedItems() {
  const batch = writeBatch(db);
  let commitNeeded = false;

  const querySnapshot = await getDocs(collection(db, 'items'));
  if (querySnapshot.empty) {
    INITIAL_ITEMS.forEach((itemData) => {
      const newDoc = doc(collection(db, 'items'));
      batch.set(newDoc, {
        ...itemData,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: 'System'
      });
    });
    commitNeeded = true;
  }

  const sectorsSnapshot = await getDocs(collection(db, 'sectors'));
  if (sectorsSnapshot.empty) {
    INITIAL_SECTORS.forEach((sectorData) => {
      const { id, ...data } = sectorData;
      const newDoc = doc(db, 'sectors', id);
      batch.set(newDoc, data);
    });
    commitNeeded = true;
  }

  if (commitNeeded) {
    await batch.commit();
  }
}
