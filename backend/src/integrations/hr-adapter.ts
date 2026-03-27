// HR System Integration Adapter
// Currently: manual entry via /api/config/hours-worked
// Future: connect to Herzog HR system API

export interface HrEmployeeData {
  employeeId: string;
  name: string;
  jobTitle: string;
  division: string;
  yearsExperience: number;
}

export interface HrHoursData {
  division: string;
  year: number;
  month: number;
  hours: number;
}

// Interface for future HR system connector
export interface HrAdapter {
  getEmployee(employeeId: string): Promise<HrEmployeeData | null>;
  getHoursWorked(division: string, year: number, month: number): Promise<HrHoursData | null>;
  syncAllHours(year: number): Promise<HrHoursData[]>;
}

// Placeholder implementation - returns null, data comes from manual entry
export class ManualHrAdapter implements HrAdapter {
  async getEmployee(_employeeId: string): Promise<HrEmployeeData | null> {
    return null; // Not connected - use manual entry
  }
  async getHoursWorked(_division: string, _year: number, _month: number): Promise<HrHoursData | null> {
    return null; // Not connected - use manual entry
  }
  async syncAllHours(_year: number): Promise<HrHoursData[]> {
    return []; // Not connected
  }
}
