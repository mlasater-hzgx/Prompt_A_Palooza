export interface TrainingStatus {
  employeeId: string;
  courseId: string;
  courseName: string;
  completed: boolean;
  completedDate: Date | null;
}

export interface TrainingAdapter {
  getTrainingStatus(employeeId: string, courseId?: string): Promise<TrainingStatus[]>;
  isTrainingComplete(employeeId: string, courseId: string): Promise<boolean>;
}

export class ManualTrainingAdapter implements TrainingAdapter {
  async getTrainingStatus(_employeeId: string, _courseId?: string): Promise<TrainingStatus[]> {
    return []; // Not connected - verification done manually on CAPA
  }
  async isTrainingComplete(_employeeId: string, _courseId: string): Promise<boolean> {
    return false; // Not connected
  }
}
