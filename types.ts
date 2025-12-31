
export interface Role {
  id: string;
  label: string;
  subLabel: string;
  salary: number; // default salary
  minSalary: number;
  maxSalary: number;
  icon: string;
}

export interface Attendee {
  roleId: string;
  count: number;
}

export interface BurnSummary {
  durationFormatted: string;
  totalPeople: number;
  totalCost: string;
  hourlyRate: string;
}
