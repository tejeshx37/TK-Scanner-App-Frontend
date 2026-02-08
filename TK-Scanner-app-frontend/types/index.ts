export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export interface TeamMember {
  memberId: string;
  name: string;
  phone: string;
  isLeader: boolean;
  checkedIn: boolean;
  checkedInAt?: string;
}

export interface StudentData {
  name: string;
  passType: string;
  amountPaid: number;
  _id?: string; // Firestore Document ID
  firstCheckInTime?: string; // ISO timestamp, present only if duplicate
  members?: TeamMember[]; // Present for group events
}

export type ScanStatus = 'valid' | 'duplicate' | 'invalid';

export interface ScanResponse {
  status: ScanStatus;
  student?: StudentData;
  error?: string;
}

export interface ConfirmResponse {
  success: boolean;
  error?: string;
}
