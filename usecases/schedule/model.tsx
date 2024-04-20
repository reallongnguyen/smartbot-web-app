export interface Schedule {
  id: string;
  deviceId: string;
  schedule: string;
  action: string;
  isRepeat: boolean;
  lastRanAt?: string;
  createdAt: string;
  updatedAt: string;
}
