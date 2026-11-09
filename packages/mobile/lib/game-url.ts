import Constants from "expo-constants";

/** URL do jogo web (mesma origem da API do template). */
export const GAME_URL = String(
  Constants.expoConfig?.extra?.apiUrl ?? process.env.EXPO_PUBLIC_API_URL ?? "https://cdn.jsdelivr.net/gh/eskildssenrenan52-hash/Mechachampionscomplete-5848@22dc4aa/packages/web/dist/index.html",
).replace(/\/+$/, "");
