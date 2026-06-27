export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO'

export interface SystemAlert {
  type: string
  message: string
  severity: AlertSeverity
}

export interface MedicalEventsByStatus {
  PENDING: number
  NOTIFIED: number
  FAILED: number
}

export interface MedicalEventsByUrgency {
  '1h': number
  '2h': number
  '4h': number
  '8h': number
  '24h': number
}

export interface DailyEventCount {
  date: string
  count: number
}

export interface TopClinicStat {
  clinicId: string
  clinicName: string
  count: number
}

export interface ClinicsByType {
  DAVLAT: number
  XUSUSIY: number
  TEZYOR_103: number
}

export interface LabEventsStats {
  total: number
  today: number
  normal: number
  abnormal: number
  critical: number
}

export interface LabsStats {
  total: number
  active: number
  inactive: number
}

export interface DashboardStats {
  generatedAt: string
  medicalEvents: {
    total: number
    today: number
    thisWeek: number
    thisMonth: number
    byStatus: MedicalEventsByStatus
    byUrgency: MedicalEventsByUrgency
    last30Days: DailyEventCount[]
    topClinics: TopClinicStat[]
  }
  clinics: {
    total: number
    active: number
    inactive: number
    byType: ClinicsByType
    newThisMonth: number
    expiringKeysIn30Days: number
  }
  clinicApplications: {
    pending: number
    approvedThisMonth: number
    rejectedThisMonth: number
    totalApproved: number
    totalRejected: number
    approvalRate: number
  }
  dmedSync: {
    total: number
    success: number
    failed: number
    successRate: number
    failedToday: number
    successToday: number
  }
  users: {
    total: number
    admins: number
    operators: number
    doctors: number
  }
  labEvents?: LabEventsStats
  labs?: LabsStats
  systemAlerts: SystemAlert[]
}
