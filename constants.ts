
import { Role } from './types';

export const BURDEN_FACTOR = 1.3;
export const HOURS_PER_YEAR = 2080;

export const ROLES: Role[] = [
  {
    id: 'junior',
    label: 'The Note Taker',
    subLabel: 'Junior / Intern',
    salary: 65000,
    minSalary: 40000,
    maxSalary: 95000,
    icon: '📝'
  },
  {
    id: 'mid',
    label: 'The Actual Worker',
    subLabel: 'Mid-Level',
    salary: 105000,
    minSalary: 80000,
    maxSalary: 145000,
    icon: '🛠️'
  },
  {
    id: 'lead',
    label: 'Spreadsheet Warrior',
    subLabel: 'Team Lead',
    salary: 145000,
    minSalary: 120000,
    maxSalary: 195000,
    icon: '📊'
  },
  {
    id: 'senior',
    label: 'Decision Delayer',
    subLabel: 'Senior Manager',
    salary: 185000,
    minSalary: 150000,
    maxSalary: 260000,
    icon: '⏳'
  },
  {
    id: 'director',
    label: 'Slide Critic',
    subLabel: 'Director / VP',
    salary: 275000,
    minSalary: 220000,
    maxSalary: 420000,
    icon: '📉'
  },
  {
    id: 'csuite',
    label: 'The Final Boss',
    subLabel: 'C-Suite',
    salary: 450000,
    minSalary: 350000,
    maxSalary: 950000,
    icon: '👑'
  }
];

export const STATUS_MILESTONES = [
  { threshold: 0, severity: "Safe Zone", message: "Starting the engine. Enjoy the silence while it lasts." },
  { threshold: 15, severity: "Minor Leak", message: "We just burned a fancy Avocado Toast. Was that update really necessary?" },
  { threshold: 45, severity: "Mild Inefficiency", message: "A nice steak dinner just evaporated. Still talking about the weather?" },
  { threshold: 100, severity: "Noticeable Drain", message: "AirPods Pro gone. Someone is definitely on mute and checking their phone." },
  { threshold: 250, severity: "Resource Bleed", message: "New iPad vaporized. 'Let's circle back' is costing us actual money now." },
  { threshold: 500, severity: "Corporate Fever", message: "Monthly gym membership for the whole floor: Gone. 'High-level alignment' is expensive." },
  { threshold: 1000, severity: "Critical Waste", message: "Round-trip to Paris reached. We could be at the Louvre, but we're looking at Slide 4." },
  { threshold: 2500, severity: "Financial Fire", message: "A high-end MacBook Pro just went up in smoke. This could have been a 2-sentence email." },
  { threshold: 5000, severity: "Emergency Level", message: "Used Honda Civic evaporated. Is the 'synergy' in the room with us right now?" },
  { threshold: 10000, severity: "Malpractice", message: "A Rolex Submariner is gone. We are paying to watch a screen share fail." },
  { threshold: 25000, severity: "Total Meltdown", message: "Year of college tuition burned. The CEO is nodding but hasn't heard a word in 20 minutes." },
  { threshold: 50000, severity: "Economic Hazard", message: "Down payment on a house: POOF. Should we schedule a follow-up to discuss this meeting?" },
  { threshold: 100000, severity: "Company Liability", message: "A Tesla Model S has been liquidated. We've officially entered the 'Deep Dive' abyss." },
  { threshold: 250000, severity: "National Debt", message: "A literal house is gone. At this point, the meeting is the company's biggest expense." }
];
