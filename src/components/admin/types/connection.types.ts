export type connectionStatus = "activate" | "expired" | "expiring";

export interface ConnectionInfo {
    id : string;
    userName : String;
    plan : string;
    ipaddress : string;
    macAddress :  string;
    dataUsed : number;
    dataLimit : number;
    timeRemaining : string;
    devices : number;
    startTime : string;
    endTime : string;
    status : connectionStatus;
    isBlocked : boolean;
}