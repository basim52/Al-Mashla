import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface SharedList {
  id: string;
  store: string;
  budget: string;
  loveNote: string;
  includeSurprise: boolean;
  status: 'active' | 'completed';
}

export interface SharedItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  note: string;
  completed: boolean;
}

export const MashlaService = {
  async createSharedList(list: Omit<SharedList, 'id'>, items: Omit<SharedItem, 'id'>[]) {
    const listId = doc(collection(db, 'mashla_lists')).id;
    const listRef = doc(db, 'mashla_lists', listId);
    
    try {
      const batch = writeBatch(db);
      
      batch.set(listRef, {
        ...list,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      items.forEach((item) => {
        const itemRef = doc(collection(listRef, 'items'));
        batch.set(itemRef, item);
      });
      
      await batch.commit();
      return listId;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `mashla_lists/${listId}`);
      return null;
    }
  },

  listenToList(listId: string, callback: (list: SharedList) => void) {
    const listRef = doc(db, 'mashla_lists', listId);
    return onSnapshot(listRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as SharedList);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `mashla_lists/${listId}`);
    });
  },

  listenToItems(listId: string, callback: (items: SharedItem[]) => void) {
    const itemsRef = collection(db, 'mashla_lists', listId, 'items');
    return onSnapshot(itemsRef, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SharedItem));
      callback(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `mashla_lists/${listId}/items`);
    });
  },

  async toggleItemCompletion(listId: string, itemId: string, completed: boolean) {
    const itemRef = doc(db, 'mashla_lists', listId, 'items', itemId);
    try {
      await updateDoc(itemRef, { completed });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `mashla_lists/${listId}/items/${itemId}`);
    }
  }
};
