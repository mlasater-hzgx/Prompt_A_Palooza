export interface JobSite {
  id: string;
  name: string;
  projectNumber: string;
  location: { latitude: number; longitude: number } | null;
}

export interface CrewAssignment {
  employeeId: string;
  jobSiteId: string;
  date: Date;
}

export interface DispatchAdapter {
  getActiveJobSites(): Promise<JobSite[]>;
  getCrewForJobSite(jobSiteId: string, date: Date): Promise<CrewAssignment[]>;
}

export class ManualDispatchAdapter implements DispatchAdapter {
  async getActiveJobSites(): Promise<JobSite[]> {
    return []; // Not connected - job sites entered manually
  }
  async getCrewForJobSite(_jobSiteId: string, _date: Date): Promise<CrewAssignment[]> {
    return []; // Not connected
  }
}
