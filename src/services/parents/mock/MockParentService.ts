import {
  demoChapters,
  demoPreviousMastery,
  demoSessions,
  demoSettings,
  demoWeek,
} from '@/data/mock/parentSpace';

import type {
  ChildProgress,
  ParentalSettings,
  ParentNotifications,
  ParentService,
  ParentSession,
  ParentWeek,
  ProgressPeriod,
} from '../ParentService';

/** Espace Parents simulé : les données de Léa (maquettes P1 à P4), réglages gardés en mémoire. */
export class MockParentService implements ParentService {
  private settingsByChild = new Map<string, ParentalSettings>();
  private notificationPrefs: ParentNotifications = { weeklyReport: true, alerts: true };

  async week(_studentId: string, today = new Date()): Promise<ParentWeek> {
    return demoWeek(today);
  }

  async progress(_studentId: string, period: ProgressPeriod): Promise<ChildProgress> {
    return { chapters: demoChapters, previousMastery: demoPreviousMastery[period] };
  }

  async sessions(_studentId: string, today = new Date()): Promise<readonly ParentSession[]> {
    return demoSessions(today);
  }

  async settings(studentId: string): Promise<ParentalSettings> {
    return this.settingsByChild.get(studentId) ?? demoSettings;
  }

  async updateSettings(
    studentId: string,
    patch: Partial<ParentalSettings>,
  ): Promise<ParentalSettings> {
    const next = { ...(await this.settings(studentId)), ...patch };
    this.settingsByChild.set(studentId, next);
    return next;
  }

  async notifications(): Promise<ParentNotifications> {
    return this.notificationPrefs;
  }

  async updateNotifications(patch: Partial<ParentNotifications>): Promise<ParentNotifications> {
    this.notificationPrefs = { ...this.notificationPrefs, ...patch };
    return this.notificationPrefs;
  }
}
