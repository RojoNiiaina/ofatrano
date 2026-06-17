import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Building, Payment, Room, Tenant } from '../types/models';
import { toPeriod } from '../utils/payments';

type DataContextType = {
  buildings: Building[];
  rooms: Room[];
  tenants: Tenant[];
  payments: Payment[];
  isLoaded: boolean;

  addBuilding: (building: Omit<Building, 'id'>, defaultRoomCost?: number) => Promise<string>;
  updateBuilding: (building: Building) => Promise<void>;
  deleteBuilding: (buildingId: string) => Promise<void>;

  addRoom: (room: Omit<Room, 'id'>) => Promise<void>;
  updateRoom: (room: Room) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;

  addTenant: (tenant: Omit<Tenant, 'id'>) => Promise<string>;
  updateTenant: (tenant: Tenant) => Promise<void>;
  deleteTenant: (tenantId: string) => Promise<void>;

  recordPayment: (payment: Omit<Payment, 'id' | 'status' | 'period'> & { period?: string }) => Promise<void>;

  assignTenantToRoom: (tenantData: Omit<Tenant, 'id' | 'roomId'>, roomId: string) => Promise<void>;
  removeTenantFromRoom: (roomId: string) => Promise<void>;

  clearAllData: () => Promise<void>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BUILDINGS: '@ofatrano_buildings',
  ROOMS: '@ofatrano_rooms',
  TENANTS: '@ofatrano_tenants',
  PAYMENTS: '@ofatrano_payments',
};

const generateId = () => Math.random().toString(36).substring(2, 9);

const syncBuildingRoomCounts = (buildings: Building[], rooms: Room[]): Building[] =>
  buildings.map((b) => ({
    ...b,
    roomCount: rooms.filter((r) => r.buildingId === b.id).length,
  }));

const migrateRooms = (rooms: Room[]): Room[] =>
  rooms.map((room, index) => ({
    ...room,
    number: room.number ?? index + 1,
  }));

const migratePayments = (payments: Payment[]): Payment[] =>
  payments.map((p) => ({
    ...p,
    period: p.period ?? p.date.slice(0, 7),
  }));

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const persistAll = async (
    nextBuildings: Building[],
    nextRooms: Room[],
    nextTenants: Tenant[],
    nextPayments: Payment[]
  ) => {
    const syncedBuildings = syncBuildingRoomCounts(nextBuildings, nextRooms);
    setBuildings(syncedBuildings);
    setRooms(nextRooms);
    setTenants(nextTenants);
    setPayments(nextPayments);
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.BUILDINGS, JSON.stringify(syncedBuildings)],
      [STORAGE_KEYS.ROOMS, JSON.stringify(nextRooms)],
      [STORAGE_KEYS.TENANTS, JSON.stringify(nextTenants)],
      [STORAGE_KEYS.PAYMENTS, JSON.stringify(nextPayments)],
    ]);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedBuildings = await AsyncStorage.getItem(STORAGE_KEYS.BUILDINGS);

        if (storedBuildings) {
          const loadedBuildings: Building[] = JSON.parse(storedBuildings);
          const loadedRooms = migrateRooms(JSON.parse((await AsyncStorage.getItem(STORAGE_KEYS.ROOMS)) || '[]'));
          const loadedTenants: Tenant[] = JSON.parse((await AsyncStorage.getItem(STORAGE_KEYS.TENANTS)) || '[]');
          const loadedPayments = migratePayments(JSON.parse((await AsyncStorage.getItem(STORAGE_KEYS.PAYMENTS)) || '[]'));
          const syncedBuildings = syncBuildingRoomCounts(loadedBuildings, loadedRooms);

          setBuildings(syncedBuildings);
          setRooms(loadedRooms);
          setTenants(loadedTenants);
          setPayments(loadedPayments);
        } else {
          setBuildings([]);
          setRooms([]);
          setTenants([]);
          setPayments([]);

          await AsyncStorage.multiSet([
            [STORAGE_KEYS.BUILDINGS, JSON.stringify([])],
            [STORAGE_KEYS.ROOMS, JSON.stringify([])],
            [STORAGE_KEYS.TENANTS, JSON.stringify([])],
            [STORAGE_KEYS.PAYMENTS, JSON.stringify([])],
          ]);
        }
      } catch (error) {
        console.error('Error loading data from AsyncStorage:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  const addBuilding = async (building: Omit<Building, 'id'>, defaultRoomCost = 0) => {
    const buildingId = generateId();
    const newBuilding: Building = { ...building, id: buildingId, roomCount: building.roomCount };

    const newRooms: Room[] = Array.from({ length: building.roomCount }, (_, i) => ({
      id: generateId(),
      buildingId,
      number: i + 1,
      cost: defaultRoomCost,
      status: 'available' as const,
      tenantId: null,
    }));

    await persistAll(
      [...buildings, newBuilding],
      [...rooms, ...newRooms],
      tenants,
      payments
    );
    return buildingId;
  };

  const updateBuilding = async (building: Building) => {
    await persistAll(
      buildings.map((b) => (b.id === building.id ? building : b)),
      rooms,
      tenants,
      payments
    );
  };

  const deleteBuilding = async (buildingId: string) => {
    const roomIds = rooms.filter((r) => r.buildingId === buildingId).map((r) => r.id);
    const tenantIds = tenants.filter((t) => roomIds.includes(t.roomId)).map((t) => t.id);

    await persistAll(
      buildings.filter((b) => b.id !== buildingId),
      rooms.filter((r) => r.buildingId !== buildingId),
      tenants.filter((t) => !tenantIds.includes(t.id)),
      payments.filter((p) => !roomIds.includes(p.roomId))
    );
  };

  const addRoom = async (room: Omit<Room, 'id'>) => {
    const newRoom: Room = { ...room, id: generateId() };
    const buildingRooms = rooms.filter((r) => r.buildingId === room.buildingId);
    const nextNumber = room.number || buildingRooms.length + 1;
    await persistAll(buildings, [...rooms, { ...newRoom, number: nextNumber }], tenants, payments);
  };

  const updateRoom = async (room: Room) => {
    await persistAll(
      buildings,
      rooms.map((r) => (r.id === room.id ? room : r)),
      tenants,
      payments
    );
  };

  const deleteRoom = async (roomId: string) => {
    await persistAll(
      buildings,
      rooms.filter((r) => r.id !== roomId),
      tenants.filter((t) => t.roomId !== roomId),
      payments.filter((p) => p.roomId !== roomId)
    );
  };

  const addTenant = async (tenant: Omit<Tenant, 'id'>) => {
    const id = generateId();
    const newTenant: Tenant = { ...tenant, id };
    await persistAll(buildings, rooms, [...tenants, newTenant], payments);
    return id;
  };

  const updateTenant = async (tenant: Tenant) => {
    await persistAll(
      buildings,
      rooms,
      tenants.map((t) => (t.id === tenant.id ? tenant : t)),
      payments
    );
  };

  const deleteTenant = async (tenantId: string) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    const updatedRooms = tenant
      ? rooms.map((r) =>
          r.id === tenant.roomId ? { ...r, status: 'available' as const, tenantId: null } : r
        )
      : rooms;

    await persistAll(
      buildings,
      updatedRooms,
      tenants.filter((t) => t.id !== tenantId),
      payments.filter((p) => p.tenantId !== tenantId)
    );
  };

  const recordPayment = async (
    payment: Omit<Payment, 'id' | 'status' | 'period'> & { period?: string }
  ) => {
    const period = payment.period ?? toPeriod(new Date(payment.date));
    const alreadyPaid = payments.some(
      (p) =>
        p.tenantId === payment.tenantId &&
        (p.period ?? p.date.slice(0, 7)) === period &&
        p.status === 'paid'
    );
    if (alreadyPaid) {
      throw new Error('PAYMENT_ALREADY_RECORDED');
    }

    const newPayment: Payment = {
      ...payment,
      id: generateId(),
      period,
      status: 'paid',
    };
    await persistAll(buildings, rooms, tenants, [...payments, newPayment]);
  };

  const assignTenantToRoom = async (tenantData: Omit<Tenant, 'id' | 'roomId'>, roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room || room.status === 'occupied') {
      throw new Error('ROOM_NOT_AVAILABLE');
    }

    const tenantId = generateId();
    const newTenant: Tenant = { ...tenantData, id: tenantId, roomId };
    const updatedRooms = rooms.map((r) =>
      r.id === roomId ? { ...r, status: 'occupied' as const, tenantId } : r
    );

    await persistAll(buildings, updatedRooms, [...tenants, newTenant], payments);
  };

  const removeTenantFromRoom = async (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room?.tenantId) return;

    const tenantId = room.tenantId;
    const updatedRooms = rooms.map((r) =>
      r.id === roomId ? { ...r, status: 'available' as const, tenantId: null } : r
    );

    await persistAll(
      buildings,
      updatedRooms,
      tenants.filter((t) => t.id !== tenantId),
      payments.filter((p) => p.tenantId !== tenantId)
    );
  };

  const clearAllData = async () => {
    setBuildings([]);
    setRooms([]);
    setTenants([]);
    setPayments([]);
    await AsyncStorage.clear();
  };

  return (
    <DataContext.Provider
      value={{
        buildings,
        rooms,
        tenants,
        payments,
        isLoaded,
        addBuilding,
        updateBuilding,
        deleteBuilding,
        addRoom,
        updateRoom,
        deleteRoom,
        addTenant,
        updateTenant,
        deleteTenant,
        recordPayment,
        assignTenantToRoom,
        removeTenantFromRoom,
        clearAllData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
