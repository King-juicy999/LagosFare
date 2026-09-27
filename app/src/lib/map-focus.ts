import { createContext, useContext } from "react";

export interface MapFocusTarget {
  origin: string;
  destination: string;
  nonce: number;
}

export interface MapFocusValue {
  focus: MapFocusTarget | null;
  focusOnMap: (origin: string, destination: string) => void;
}

export const MapFocusContext = createContext<MapFocusValue>({
  focus: null,
  focusOnMap: () => {},
});

export function useMapFocus(): MapFocusValue {
  return useContext(MapFocusContext);
}
