import fs from 'fs';
import path from 'path';
import { db, isDbConfigured } from './index.ts';
import { users } from './schema.ts';
import { eq, or, sql } from 'drizzle-orm';

export interface UserPermissionsData {
  canAccessCrm: boolean;
  canEditDeals: boolean;
  canReopenClosedDeals: boolean;
  canDeleteDeals: boolean;
  canAccessCms: boolean;
  canManageUsers: boolean;
  canExportReports: boolean;
  canManageContracts: boolean;
  canManageTickets: boolean;
  canManageLicenses: boolean;
  canViewCertificates?: boolean;
  canViewMetrologyReports?: boolean;
}

export const DEFAULT_ROLE_PERMISSIONS_SERVER: Record<'superadmin' | 'admin' | 'moderator' | 'manager' | 'client' | 'engineer', UserPermissionsData> = {
  superadmin: {
    canAccessCrm: true,
    canEditDeals: true,
    canReopenClosedDeals: true,
    canDeleteDeals: true,
    canAccessCms: true,
    canManageUsers: true,
    canExportReports: true,
    canManageContracts: true,
    canManageTickets: true,
    canManageLicenses: true,
    canViewCertificates: true,
    canViewMetrologyReports: true,
  },
  admin: {
    canAccessCrm: true,
    canEditDeals: true,
    canReopenClosedDeals: true,
    canDeleteDeals: true,
    canAccessCms: true,
    canManageUsers: true,
    canExportReports: true,
    canManageContracts: true,
    canManageTickets: true,
    canManageLicenses: true,
    canViewCertificates: true,
    canViewMetrologyReports: true,
  },
  moderator: {
    canAccessCrm: false,
    canEditDeals: false,
    canReopenClosedDeals: false,
    canDeleteDeals: false,
    canAccessCms: true,
    canManageUsers: false,
    canExportReports: false,
    canManageContracts: false,
    canManageTickets: false,
    canManageLicenses: false,
    canViewCertificates: true,
    canViewMetrologyReports: true,
  },
  manager: {
    canAccessCrm: true,
    canEditDeals: true,
    canReopenClosedDeals: false,
    canDeleteDeals: false,
    canAccessCms: false,
    canManageUsers: false,
    canExportReports: true,
    canManageContracts: true,
    canManageTickets: true,
    canManageLicenses: true,
    canViewCertificates: true,
    canViewMetrologyReports: true,
  },
  engineer: {
    canAccessCrm: true,
    canEditDeals: false,
    canReopenClosedDeals: false,
    canDeleteDeals: false,
    canAccessCms: false,
    canManageUsers: false,
    canExportReports: true,
    canManageContracts: false,
    canManageTickets: true,
    canManageLicenses: false,
    canViewCertificates: true,
    canViewMetrologyReports: true,
  },
  client: {
    canAccessCrm: false,
    canEditDeals: false,
    canReopenClosedDeals: false,
    canDeleteDeals: false,
    canAccessCms: false,
    canManageUsers: false,
    canExportReports: false,
    canManageContracts: false,
    canManageTickets: false,
    canManageLicenses: false,
    canViewCertificates: true,
    canViewMetrologyReports: true,
  },
};

export interface DbUserRecord {
  id: string;
  email: string;
  fullName: string;
  company: string;
  position: string;
  phone: string;
  role: 'superadmin' | 'admin' | 'moderator' | 'manager' | 'client';
  permissions: UserPermissionsData;
  password?: string;
  contractNumber?: string;
  avatar?: string;
  createdAt: string;
}

// Default in-memory enterprise user repository for fast access and fallback
const INITIAL_SYSTEM_USERS: DbUserRecord[] = [
  {
    id: 'adm-01',
    email: 's.nekrasov@ds-enginering.ru',
    fullName: 'Некрасов Сергей Юрьевич',
    role: 'superadmin',
    position: 'Генеральный директор',
    company: 'ООО «ДС‑Инжиниринг»',
    phone: '+7 (846) 954-02-92',
    permissions: DEFAULT_ROLE_PERMISSIONS_SERVER.superadmin,
    password: 'admin123',
    contractNumber: 'АДМ-001',
    avatar: '',
    createdAt: '2026-01-01',
  },
  {
    id: 'adm-02',
    email: 'a.skobelev@ds-enginering.ru',
    fullName: 'Скобелев Александр Сергеевич',
    role: 'manager',
    position: 'Инженер по внедрению CAD/CAM и постпроцессорам',
    company: 'ООО «ДС‑Инжиниринг»',
    phone: '+7 (937) 984-61-51',
    permissions: {
      ...DEFAULT_ROLE_PERMISSIONS_SERVER.manager,
      canAccessCms: true,
      canReopenClosedDeals: true,
      canExportReports: true,
      canManageContracts: true,
      canManageTickets: true,
      canManageLicenses: true,
    canViewCertificates: true,
    canViewMetrologyReports: true,
    },
    password: 'admin123',
    contractNumber: 'АДМ-002',
    avatar: '',
    createdAt: '2026-01-01',
  },
  {
    id: 'adm-03',
    email: 'i.yarish@ds-enginering.ru',
    fullName: 'Ярыш Иван Владимирович',
    role: 'manager',
    position: 'Инженер-метролог',
    company: 'ООО «ДС‑Инжиниринг»',
    phone: '+7 (927) 748-46-58',
    permissions: DEFAULT_ROLE_PERMISSIONS_SERVER.manager,
    password: 'admin123',
    contractNumber: 'АДМ-003',
    avatar: '',
    createdAt: '2026-01-01',
  },
  {
    id: 'adm-04',
    email: 'a.yarish@ds-enginering.ru',
    fullName: 'Ярыш Александр Владимирович',
    role: 'manager',
    position: 'Инженер по подбору оборудования и ПО',
    company: 'ООО «ДС‑Инжиниринг»',
    phone: '+7 (927) 719-06-97',
    permissions: DEFAULT_ROLE_PERMISSIONS_SERVER.manager,
    password: 'admin123',
    contractNumber: 'АДМ-004',
    avatar: '',
    createdAt: '2026-01-01',
  },
  {
    id: 'adm-05',
    email: 'v.morozov@ds-enginering.ru',
    fullName: 'Морозов Владимир Георгиевич',
    role: 'manager',
    position: 'Руководитель КТО',
    company: 'ООО «ДС‑Инжиниринг»',
    phone: '+7 (902) 371-20-16',
    permissions: DEFAULT_ROLE_PERMISSIONS_SERVER.manager,
    password: 'admin123',
    contractNumber: 'АДМ-005',
    avatar: '',
    createdAt: '2026-01-01',
  },
  {
    id: 'adm-06',
    email: 'moderator@ds-enginering.ru',
    fullName: 'Модератор Сайта',
    role: 'moderator',
    position: 'Контент-менеджер / Наполнение сайта',
    company: 'ООО «ДС‑Инжиниринг»',
    phone: '+7 (846) 954-02-92',
    permissions: DEFAULT_ROLE_PERMISSIONS_SERVER.moderator,
    password: 'moderator123',
    contractNumber: 'АДМ-006',
    avatar: '',
    createdAt: '2026-01-01',
  },
  {
    id: 'cli-01',
    email: 'd.petrov@aviaagregat.ru',
    fullName: 'Петров Дмитрий Николаевич',
    role: 'client',
    position: 'Главный технолог',
    company: 'АО «Авиаагрегат-Самара»',
    phone: '+7 (917) 123-45-67',
    permissions: DEFAULT_ROLE_PERMISSIONS_SERVER.client,
    password: 'client123',
    contractNumber: 'ДОГ-2026-СМР/04',
    avatar: '',
    createdAt: '2026-01-01',
  }
];

const USERS_DATA_FILE = path.join(process.cwd(), 'data', 'users.json');

export function saveUsersToDisk() {
  try {
    const dir = path.dirname(USERS_DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_DATA_FILE, JSON.stringify(memoryUsers, null, 2), 'utf-8');
  } catch (err) {
    console.error('[USERS STORAGE] Failed to save users to disk:', err);
  }
}

function loadUsersFromDisk(): DbUserRecord[] {
  try {
    if (fs.existsSync(USERS_DATA_FILE)) {
      const content = fs.readFileSync(USERS_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const merged = [...parsed];
        for (const defaultUser of INITIAL_SYSTEM_USERS) {
          if (!merged.some(u => u.id === defaultUser.id || u.email.toLowerCase() === defaultUser.email.toLowerCase())) {
            merged.unshift(defaultUser);
          }
        }
        return merged;
      }
    }
  } catch (err) {
    console.error('[USERS STORAGE] Failed to load users from disk:', err);
  }
  return [...INITIAL_SYSTEM_USERS];
}

let memoryUsers: DbUserRecord[] = loadUsersFromDisk();

export async function getOrCreateUser(uid: string, email: string) {
  if (isDbConfigured()) {
    try {
      const result = await db.insert(users)
        .values({ uid, email })
        .onConflictDoUpdate({
          target: users.uid,
          set: { email },
        })
        .returning();
      return result[0];
    } catch {
      // fallback to memory
    }
  }
  let existing = memoryUsers.find(u => u.id === uid || u.email.toLowerCase() === email.toLowerCase());
  if (!existing) {
    existing = {
      id: uid,
      email: email.toLowerCase(),
      fullName: '',
      company: 'ООО «ДС‑Инжиниринг»',
      position: '',
      phone: '',
      role: 'client',
      permissions: DEFAULT_ROLE_PERMISSIONS_SERVER.client,
      createdAt: new Date().toISOString().split('T')[0]
    };
    memoryUsers.push(existing);
    saveUsersToDisk();
  }
  return existing;
}

export async function getAllDbUsers(): Promise<DbUserRecord[]> {
  if (isDbConfigured()) {
    try {
      const rows = await db.select().from(users).orderBy(users.id);
      if (rows && rows.length > 0) {
        const mappedUsers: DbUserRecord[] = rows.map((r) => {
          const role = r.role as any;
          const defaultPerms = DEFAULT_ROLE_PERMISSIONS_SERVER[role] || DEFAULT_ROLE_PERMISSIONS_SERVER.client;
          const parsedPerms = (r.permissions && typeof r.permissions === 'object') ? { ...defaultPerms, ...r.permissions } : defaultPerms;

          return {
            id: r.uid || String(r.id),
            email: r.email,
            fullName: r.fullName || '',
            company: r.organization || 'ООО «ДС‑Инжиниринг»',
            position: r.position || '',
            phone: r.phone || '',
            role,
            permissions: parsedPerms,
            password: r.password || '123456',
            contractNumber: r.contractNumber || '',
            avatar: r.avatar || '',
            createdAt: r.createdAt ? r.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          };
        });
        memoryUsers = mappedUsers;
        return mappedUsers;
      }
    } catch {
      // Graceful fallback to memory store
    }
  }
  return [...memoryUsers];
}

export async function getDbUserByIdOrEmail(idOrEmail: string): Promise<DbUserRecord | null> {
  const clean = idOrEmail.toLowerCase().trim();
  const localMatch = memoryUsers.find(u => u.id === idOrEmail || u.email.toLowerCase() === clean);

  if (isDbConfigured()) {
    try {
      const rows = await db.select().from(users).where(
        or(
          eq(users.uid, idOrEmail),
          eq(users.email, clean),
          sql`id::text = ${idOrEmail}`
        )
      ).limit(1);

      if (rows && rows.length > 0) {
        const r = rows[0];
        const role = r.role as any;
        const defaultPerms = DEFAULT_ROLE_PERMISSIONS_SERVER[role] || DEFAULT_ROLE_PERMISSIONS_SERVER.client;
        const parsedPerms = (r.permissions && typeof r.permissions === 'object') ? { ...defaultPerms, ...r.permissions } : defaultPerms;

        return {
          id: r.uid || String(r.id),
          email: r.email,
          fullName: r.fullName || '',
          company: r.organization || 'ООО «ДС‑Инжиниринг»',
          position: r.position || '',
          phone: r.phone || '',
          role,
          permissions: parsedPerms,
          password: r.password || '123456',
          contractNumber: r.contractNumber || '',
          avatar: r.avatar || '',
          createdAt: r.createdAt ? r.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        };
      }
    } catch {
      // Fallback
    }
  }

  return localMatch || null;
}

export async function createDbUser(userData: {
  id?: string;
  email: string;
  fullName: string;
  company?: string;
  position?: string;
  phone?: string;
  role: 'superadmin' | 'admin' | 'moderator' | 'manager' | 'client';
  permissions?: Partial<UserPermissionsData>;
  password?: string;
  contractNumber?: string;
  avatar?: string;
}): Promise<DbUserRecord> {
  const uid = userData.id || (userData.role === 'superadmin' ? `sup-${Date.now().toString().slice(-5)}` : userData.role === 'admin' ? `adm-${Date.now().toString().slice(-5)}` : userData.role === 'manager' ? `mng-${Date.now().toString().slice(-5)}` : `cli-${Date.now().toString().slice(-5)}`);
  const defaultPerms = DEFAULT_ROLE_PERMISSIONS_SERVER[userData.role] || DEFAULT_ROLE_PERMISSIONS_SERVER.client;
  const mergedPerms = { ...defaultPerms, ...(userData.permissions || {}) };

  const newRecord: DbUserRecord = {
    id: uid,
    email: userData.email.trim().toLowerCase(),
    fullName: userData.fullName.trim(),
    company: userData.company ? userData.company.trim() : 'ООО «ДС‑Инжиниринг»',
    position: userData.position ? userData.position.trim() : '',
    phone: userData.phone ? userData.phone.trim() : '',
    role: userData.role,
    permissions: mergedPerms,
    password: userData.password || '123456',
    contractNumber: userData.contractNumber || '',
    avatar: userData.avatar || '',
    createdAt: new Date().toISOString().split('T')[0],
  };

  memoryUsers.push(newRecord);
  saveUsersToDisk();

  if (isDbConfigured()) {
    try {
      await db.insert(users).values({
        uid,
        email: newRecord.email,
        fullName: newRecord.fullName,
        organization: newRecord.company,
        position: newRecord.position,
        phone: newRecord.phone,
        role: newRecord.role,
        permissions: newRecord.permissions,
        password: newRecord.password,
        contractNumber: newRecord.contractNumber,
        avatar: newRecord.avatar,
      }).onConflictDoNothing();
    } catch {
      // Memory record is preserved
    }
  }

  return newRecord;
}

export async function updateDbUser(uidOrId: string, updates: {
  fullName?: string;
  company?: string;
  position?: string;
  phone?: string;
  role?: 'superadmin' | 'admin' | 'moderator' | 'manager' | 'client';
  permissions?: Partial<UserPermissionsData>;
  password?: string;
  contractNumber?: string;
  avatar?: string;
}): Promise<DbUserRecord | null> {
  const existing = await getDbUserByIdOrEmail(uidOrId);
  if (!existing) return null;

  const newRole = updates.role || existing.role;
  let finalPerms = existing.permissions;
  if (updates.role && updates.role !== existing.role) {
    const defaultPerms = DEFAULT_ROLE_PERMISSIONS_SERVER[newRole] || DEFAULT_ROLE_PERMISSIONS_SERVER.client;
    finalPerms = { ...defaultPerms, ...(updates.permissions || {}) };
    console.log(`[AUTH SERVICE - ROLE TRACKING] User ${existing.email} role changed from ${existing.role} to ${newRole}. Resetting permissions:`, finalPerms);
  } else if (updates.permissions) {
    finalPerms = { ...existing.permissions, ...updates.permissions };
    console.log(`[AUTH SERVICE - ROLE TRACKING] User ${existing.email} permissions updated via user profile sync:`, finalPerms);
  }

  const updatedRecord: DbUserRecord = {
    ...existing,
    fullName: updates.fullName !== undefined ? updates.fullName.trim() : existing.fullName,
    company: updates.company !== undefined ? updates.company.trim() : existing.company,
    position: updates.position !== undefined ? updates.position.trim() : existing.position,
    phone: updates.phone !== undefined ? updates.phone.trim() : existing.phone,
    role: newRole,
    permissions: finalPerms,
    password: updates.password !== undefined ? updates.password : existing.password,
    contractNumber: updates.contractNumber !== undefined ? updates.contractNumber : existing.contractNumber,
    avatar: updates.avatar !== undefined ? updates.avatar : existing.avatar,
  };

  // Update memory store
  const idx = memoryUsers.findIndex(u => u.id === existing.id || u.email.toLowerCase() === existing.email.toLowerCase());
  if (idx >= 0) {
    memoryUsers[idx] = updatedRecord;
    saveUsersToDisk();
  }

  if (isDbConfigured()) {
    try {
      const updateValues: Record<string, any> = {
        updatedAt: new Date(),
        fullName: updatedRecord.fullName,
        organization: updatedRecord.company,
        position: updatedRecord.position,
        phone: updatedRecord.phone,
        role: updatedRecord.role,
        permissions: updatedRecord.permissions,
        password: updatedRecord.password,
        contractNumber: updatedRecord.contractNumber,
        avatar: updatedRecord.avatar,
      };

      await db.update(users)
        .set(updateValues)
        .where(or(eq(users.uid, existing.id), eq(users.email, existing.email)));
    } catch {
      // Memory record is preserved
    }
  }

  return updatedRecord;
}

export async function updateDbUserPermissions(uidOrId: string, permissions: Partial<UserPermissionsData>): Promise<DbUserRecord | null> {
  const existing = await getDbUserByIdOrEmail(uidOrId);
  if (!existing) return null;

  console.log(`[AUTH SERVICE - ROLE TRACKING] Real-time permission sync initiated for ${existing.email} (UID: ${existing.id})`);
  console.log(`[AUTH SERVICE - ROLE TRACKING] Old permissions:`, existing.permissions, 'New sync payload:', permissions);

  const updatedPerms: UserPermissionsData = {
    ...existing.permissions,
    ...permissions,
  };

  console.log(`[AUTH SERVICE - ROLE TRACKING] Final computed permissions for ${existing.email}:`, updatedPerms);

  const updatedRecord: DbUserRecord = {
    ...existing,
    permissions: updatedPerms,
  };

  const idx = memoryUsers.findIndex(u => u.id === existing.id || u.email.toLowerCase() === existing.email.toLowerCase());
  if (idx >= 0) {
    memoryUsers[idx] = updatedRecord;
    saveUsersToDisk();
  }

  if (isDbConfigured()) {
    try {
      await db.update(users)
        .set({
          permissions: updatedPerms,
          updatedAt: new Date(),
        })
        .where(or(eq(users.uid, existing.id), eq(users.email, existing.email)));
    } catch {
      // Memory record is preserved
    }
  }

  return updatedRecord;
}

export async function deleteDbUser(uidOrId: string): Promise<boolean> {
  const existing = await getDbUserByIdOrEmail(uidOrId);
  if (!existing) return false;

  memoryUsers = memoryUsers.filter(u => u.id !== existing.id && u.email.toLowerCase() !== existing.email.toLowerCase());
  saveUsersToDisk();

  if (isDbConfigured()) {
    try {
      await db.delete(users).where(or(eq(users.uid, existing.id), eq(users.email, existing.email)));
    } catch {
      // Memory record is removed
    }
  }

  return true;
}

export async function seedInitialUsersIfEmpty(initialAccounts: Array<{
  id: string;
  email: string;
  fullName: string;
  role: 'superadmin' | 'admin' | 'moderator' | 'manager' | 'client';
  position?: string;
  company?: string;
  phone?: string;
  password?: string;
  contractNumber?: string;
  avatar?: string;
  permissions?: Partial<UserPermissionsData>;
}>) {
  // Always ensure memory repository has the accounts
  for (const acc of initialAccounts) {
    const exists = memoryUsers.find(u => u.id === acc.id || u.email.toLowerCase() === acc.email.toLowerCase());
    if (!exists) {
      const defaultPerms = DEFAULT_ROLE_PERMISSIONS_SERVER[acc.role] || DEFAULT_ROLE_PERMISSIONS_SERVER.client;
      const mergedPerms = { ...defaultPerms, ...(acc.permissions || {}) };
      memoryUsers.push({
        id: acc.id,
        email: acc.email.trim().toLowerCase(),
        fullName: acc.fullName,
        company: acc.company || (acc.role === 'client' ? 'Предприятие' : 'ООО «ДС‑Инжиниринг»'),
        position: acc.position || '',
        phone: acc.phone || '',
        role: acc.role,
        permissions: mergedPerms,
        password: acc.password || '123456',
        contractNumber: acc.contractNumber || '',
        avatar: acc.avatar || '',
        createdAt: new Date().toISOString().split('T')[0],
      });
    }
  }

  if (isDbConfigured()) {
    try {
      const existing = await db.select({ count: sql<number>`count(*)` }).from(users);
      const count = Number(existing[0]?.count || 0);

      if (count === 0) {
        console.log(`[CloudSQL] Seeding ${initialAccounts.length} default users into PostgreSQL...`);
        for (const acc of initialAccounts) {
          const defaultPerms = DEFAULT_ROLE_PERMISSIONS_SERVER[acc.role] || DEFAULT_ROLE_PERMISSIONS_SERVER.client;
          const mergedPerms = { ...defaultPerms, ...(acc.permissions || {}) };

          await db.insert(users).values({
            uid: acc.id,
            email: acc.email.trim().toLowerCase(),
            fullName: acc.fullName,
            organization: acc.company || (acc.role === 'client' ? 'Предприятие' : 'ООО «ДС‑Инжиниринг»'),
            position: acc.position || '',
            phone: acc.phone || '',
            role: acc.role,
            permissions: mergedPerms,
            password: acc.password || '123456',
            contractNumber: acc.contractNumber || '',
            avatar: acc.avatar || '',
          }).onConflictDoNothing();
        }
      } else {
        // Only log synchronization, do not overwrite existing user permissions dynamically changed by admins
        console.log(`[AUTH SERVICE - ROLE TRACKING] Database already seeded. Skipping permission overwrite for ${initialAccounts.length} default users to preserve custom RBAC state.`);
      }
    } catch {
      // In-memory accounts are ready
    }
  }
}
