import { ConnectionInfo } from "../types/connection.types";

export function incrementDataUsage(connection: ConnectionInfo): ConnectionInfo {
	return {
		...connection,
		dataUsed: Math.min(
			connection.dataUsed + Math.random() * 0.05,
			connection.dataLimit
		),
	};
}

export function toggleBlock(connection: ConnectionInfo): ConnectionInfo {
	return { ...connection, isBlocked: !connection.isBlocked };
}

export function reduceDataLimit(connection: ConnectionInfo): ConnectionInfo {
	return {
		...connection,
		dataLimit: Math.max(connection.dataLimit * 0.5, 0.1),
	};
}

export function reduceTimeRemaining(connection: ConnectionInfo): ConnectionInfo {
	const match = connection.timeRemaining.match(/(\d+)h/);
	const hours = match ? Number(match[1]) : 1;

	return {
		...connection,
		timeRemaining: `${Math.max(hours / 2, 1)}h`,
	};
}

export function calculateKpis(connections: ConnectionInfo[]) {
	const active = connections.filter((c) => c.status === "active").length;
	const totalUsed = connections.reduce((s, c) => s + c.dataUsed, 0);
	const totalLimit = connections.reduce((s, c) => s + c.dataLimit, 0);

	return {
		active,
		totalUsed,
		totalLimit,
		usagePercent: totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0,
	};
}
