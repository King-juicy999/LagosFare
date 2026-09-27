export const COLORS = {
  background: "#F6F7F5",
  surface: "#FFFFFF",
  border: "#E3E6E1",
  ink: "#12211B",
  inkSoft: "#5C6B64",
  inkFaint: "#95A29B",
  brand: "#0B3D2C",
  brandSoft: "#E7F0EA",
  accent: "#F5A524",
  overlay: "rgba(18, 33, 27, 0.55)",
};

export const TRANSPORT = {
  brt: { label: "BRT", background: "#0B3D2C", ink: "#FFFFFF" },
  danfo: { label: "Danfo", background: "#F5A524", ink: "#12211B" },
  keke: { label: "Keke", background: "#3E7CB1", ink: "#FFFFFF" },
} as const;

export type TransportKey = keyof typeof TRANSPORT;

export function transportStyle(transportType: string): {
  label: string;
  background: string;
  ink: string;
} {
  const key = transportType.toLowerCase() as TransportKey;
  return TRANSPORT[key] ?? { label: transportType.toUpperCase(), background: COLORS.inkFaint, ink: COLORS.surface };
}

export const MAP_PINS = {
  origin: "#0B3D2C",
  destination: "#C0392B",
  default: "#0B3D2C",
};

export const LAGOS_LABEL = "Area centre, not an exact bus stop";
