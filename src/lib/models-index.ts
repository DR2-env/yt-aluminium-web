// Which products have a hand-built 3D model (see components/three/models.ts), kept here so
// server code can check without importing three.js. scripts/check-models.mjs keeps them in sync.
export const HAND_BUILT_MODELS = new Set([
  "SPIGOT", "SPIGOT-NEW", "AU010", "AU078", "AU005/2", "PC01", "PC02", "PC03", "AU007/1", "AU007/2", "AU007/3", "AU007/4",
  "AU607/1", "BL01", "BL01/New", "BL03", "BL05", "AU056", "AU057", "AU058", "AU059", "AU087/1", "AU087/2", "AU087/3",
  "AU087/4", "AU087/5", "AU087/6", "BS-WOOL", "BS-FRINGE", "GK45", "HG01", "HG02", "HG03", "HG04", "HG/Packers", "KL20",
  "KL09", "KL09/1", "KL22", "DC01", "WR01", "WR02", "RL01", "RL01/1", "RL02", "AU060", "KL01", "KL03", "KL16", "KL18",
  "KL10", "KL11", "KL14", "KL01/1", "KL16/1",
]);

/** Profiles with no sketch of their own, drawn with the closest section we have. */
export const SECTION_STANDINS: Record<string, string> = { AU025A: "AU025", AU026A: "AU026", AU055: "RODC" };
