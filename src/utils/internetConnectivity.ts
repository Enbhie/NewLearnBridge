import { useCallback, useEffect, useState } from "react";
import * as Network from "expo-network";

const REACHABILITY_URL = "https://www.google.com/generate_204";
const RECHECK_INTERVAL_MS = 15_000;
const REQUEST_TIMEOUT_MS = 5_000;

async function probeInternet(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(REACHABILITY_URL, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    return response.status === 204;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkInternetConnectivity(): Promise<boolean> {
  const state = await Network.getNetworkStateAsync();
  if (state.isConnected === false) return false;
  if (state.isConnected !== true) return false;
  if (state.isInternetReachable === true) return true;
  return probeInternet();
}

export function useInternetConnectivity() {
  const networkState = Network.useNetworkState();
  const [internetProbeSucceeded, setInternetProbeSucceeded] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    if (networkState.isConnected !== true || networkState.isInternetReachable !== false) {
      setInternetProbeSucceeded(null);
      return;
    }

    let active = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const check = async () => {
      const reachable = await probeInternet();
      if (!active) return;
      setInternetProbeSucceeded(reachable);
      timeout = setTimeout(() => void check(), RECHECK_INTERVAL_MS);
    };
    setInternetProbeSucceeded(null);
    void check();

    return () => {
      active = false;
      if (timeout !== undefined) clearTimeout(timeout);
    };
  }, [networkState.isConnected, networkState.isInternetReachable]);

  const checkInternet = useCallback(async () => {
    const reachable = await checkInternetConnectivity();
    setInternetProbeSucceeded(reachable);
    return reachable;
  }, []);
  const isOffline =
    networkState.isConnected === false ||
    (networkState.isConnected === true &&
      networkState.isInternetReachable === false &&
      internetProbeSucceeded === false);

  return { isOffline, checkInternet };
}
