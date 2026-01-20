"use client";

import { useEffect, useState } from "react";
import type { ConnectionInfo } from "../types/connection.types";
import { MOCK_CONNECTIONS } from "@/components/data/connection.mock";
import {
  incrementDataUsage,
  toggleBlock,
  reduceDataLimit,
  reduceTimeRemaining,
  calculateKpis,
} from "../services/connection.services";;

export function useConnections() {
  const [connections, setConnections] =
	useState<ConnectionInfo[]>(MOCK_CONNECTIONS);

  useEffect(() => {
	const interval = setInterval(() => {
	  setConnections((prev) => prev.map(incrementDataUsage));
	}, 5000);

	return () => clearInterval(interval);
  }, []);

  const disconnect = (id: string) => {
	setConnections((prev) => prev.filter((c) => c.id !== id));
  };

  const block = (id: string) => {
	setConnections((prev) =>
	  prev.map((c) => (c.id === id ? toggleBlock(c) : c))
	);
  };

  const reduceData = (id: string) => {
	setConnections((prev) =>
	  prev.map((c) => (c.id === id ? reduceDataLimit(c) : c))
	);
  };

  const reduceTime = (id: string) => {
	setConnections((prev) =>
	  prev.map((c) => (c.id === id ? reduceTimeRemaining(c) : c))
	);
  };

  const kpis = calculateKpis(connections);

  return {
	connections,
	kpis,
	actions: {
	  disconnect,
	  block,
	  reduceData,
	  reduceTime,
	},
  };
}
