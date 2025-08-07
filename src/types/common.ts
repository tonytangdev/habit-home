export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  }
  
  export  interface Stats {
    overview: {
      pendingTasks: number;
      completedTasks: number;
      totalPoints: number;
      totalTasks: number;
    };
    personal: {
      pendingTasks: number;
      completedTasks: number;
      totalTasks: number;
    };
    recentActivity: any[];
  }
  
  export  interface Family {
    id: string;
    name: string;
    description?: string;
    inviteCode: string;
    members: any[];
    _count: {
      tasks: number;
      members: number;
    };
  }
  
  export  interface Task {
    id: string;
    title: string;
    description?: string;
    points: number;
    category: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    dueDate?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    family: {
      id: string;
      name: string;
    };
    assignedTo?: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    createdBy: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
  }
  
  export  type SortOption = 'dueDate' | 'priority' | 'completion';