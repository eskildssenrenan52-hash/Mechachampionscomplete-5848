import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { GAME_URL } from "../lib/game-url";

const BG = "#040912";
const ACCENT = "#35e2f0";

export default function GameScreen() {
  const [opening, setOpening] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const openGame = async () => {
    setOpening(true); setError(null);
    try {
      const canOpen = await Linking.canOpenURL(GAME_URL);
      if (!canOpen) throw new Error("Nenhum navegador compatível foi encontrado.");
      await Linking.openURL(GAME_URL);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível abrir o jogo.");
    } finally { setOpening(false); }
  };

  useEffect(() => { const timer = setTimeout(() => { void openGame(); }, 450); return () => clearTimeout(timer); }, []);

  return <View style={styles.root}>
    <StatusBar hidden />
    <View style={styles.card}>
      <Text style={styles.mark}>MC</Text>
      <Text style={styles.title}>CAMPEÕES MECHA</Text>
      <Text style={styles.subtitle}>ABRINDO A ARENA</Text>
      {opening && <><ActivityIndicator color={ACCENT} size="large" /><Text style={styles.hint}>INICIANDO JOGO…</Text></>}
      {!opening && !error && <Text style={styles.hint}>O jogo foi aberto no navegador.</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.button} onPress={() => void openGame()}><Text style={styles.buttonText}>ABRIR JOGO</Text></Pressable>
      <Text style={styles.note}>O launcher não usa WebView. Isso evita encerramentos nativos em aparelhos incompatíveis.</Text>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, alignItems: "center", justifyContent: "center", padding: 22 },
  card: { width: "100%", maxWidth: 390, alignItems: "center", padding: 28, borderWidth: 1, borderColor: "#35e2f066", backgroundColor: "#071725", gap: 15 },
  mark: { color: "#ffb21a", fontSize: 30, fontWeight: "900", letterSpacing: 5 },
  title: { color: "#f0fdff", fontSize: 18, fontWeight: "800", letterSpacing: 2, textAlign: "center" },
  subtitle: { color: ACCENT, fontSize: 11, letterSpacing: 2 },
  hint: { color: "#9dbcca", fontSize: 12, textAlign: "center" },
  error: { color: "#ff9b90", fontSize: 12, textAlign: "center", lineHeight: 18 },
  button: { minWidth: 190, paddingVertical: 15, paddingHorizontal: 24, alignItems: "center", backgroundColor: "#0e556b", borderWidth: 1, borderColor: ACCENT },
  buttonText: { color: "#f0fdff", fontSize: 12, fontWeight: "800", letterSpacing: 2 },
  note: { color: "#668596", fontSize: 10, lineHeight: 15, textAlign: "center" },
});
