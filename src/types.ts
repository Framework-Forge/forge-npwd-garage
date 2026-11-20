export type VehicleType = 'car' | 'bike' | 'boat' | 'aircraft';
export type VehicleState = 'out' | 'garaged' | 'insurance' | 'impounded' | 'unknown';
export interface Destination {
  kind: 'garage' | 'insurance' | 'impound' | 'vehicle';
  label: string; action: string; distance?: number;
  coords: { x: number; y: number; z: number };
}
export interface VehicleFine {
  id: string; kind: string; description: string; location?: string;
  amount: number; total?: number; issuedAt?: number; occurredTime?: string;
  status: string; dueAt?: number; paidAt?: number;
  interestRate?: number; interestInterval?: string; invoiceAvailable?: boolean; laws?: string[];
}
export interface GarageVehicle {
  fullname: string; brand: string; model: string; spawnName: string; plate: string;
  garage?: string; state: string; stateCode: VehicleState;
  conditionCode: 'total_loss' | 'damaged' | 'normal' | 'unknown'; condition: string;
  fuel?: number | null; engine?: number | null; body?: number | null;
  engineSource?: 'saved' | 'live'; bodySource?: 'saved' | 'live'; fuelSource?: 'saved' | 'live';
  paymentsleft?: number; disableTracking: boolean; type: VehicleType;
  images: string[]; destination?: Destination; routeUnavailable?: string; observedAt?: number;
  impound?: { garage: string; reason?: string; amount?: number; paid: boolean; holdUntil?: number; requiresPolice: boolean };
  fines?: VehicleFine[]; warnings?: string[];
}
export interface NuiResponse<T = unknown> { status: 'ok' | 'error'; message?: string; data?: T; }
