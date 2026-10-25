import { useCallback } from "react";
import * as Network from "expo-network";

export function isDefinitelyOffline(
  state: Network.NetworkState
): boolean {
  return (
    state.type === Network.NetworkStateType.NONE &&
    state.isConnected !== true &&
    state.isInternetReachable !== true
  );
}

export async function checkInternetConnectivity(): Promise<boolean> {
  const state = await Network.getNetworkStateAsync();
  return !isDefinitelyOffline(state);
}

export function useInternetConnectivity() {
  const networkState = Network.useNetworkState();
  const checkInternet = useCallback(checkInternetConnectivity, []);
  const isOffline = isDefinitelyOffline(networkState);

  return { isOffline, checkInternet };
}
