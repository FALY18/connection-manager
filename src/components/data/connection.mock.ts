import { ConnectionInfo } from "../admin/types/connection.types";

export const MOCK_CONNECTIONS: ConnectionInfo[] = [
  {
    id: "1",
    username: "Ahmed Hassan",
    plan: "Plan 2h30 - 1Go",
    ipAddress: "192.168.1.45",
    macAddress: "AA:BB:CC:DD:EE:01",
    dataUsed: 0.7,
    dataLimit: 1,
    timeRemaining: "1h 45m",
    devices: 1,
    status: "active",
    startTime: "14:30",
  },
  // ...
];
