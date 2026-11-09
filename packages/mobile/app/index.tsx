import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  Platform,
  Pressable,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView, type WebViewNavigation } from "react-native-webview";
import { GAME_URL } from "../lib/game-url";

const BG = "#040912";
const ACCENT = "#35e2f0";
const LOCAL_GAME_URL = "file:///android_asset/game/index.html";

/**
 * App mobile de Campeões Mecha: embarca o jogo web em tela cheia.
 * O jogo salva progresso no localStorage do WebView (persistente no dispositivo).
 */
export default function GameScreen() {
  const webRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [sourceUri, setSourceUri] = useState(GAME_URL);
  const [mountWebView, setMountWebView] = useState(false);
  const canGoBack = useRef(false);

  // Botão físico "voltar" do Android navega dentro do jogo antes de sair.
  useEffect(() => {
    const timer = setTimeout(() => setMountWebView(true), 650);
    if (Platform.OS !== "android") return () => clearTimeout(timer);
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack.current) { webRef.current?.goBack(); return true; }
      return false;
    });
    return () => { clearTimeout(timer); sub.remove(); };
  }, []);

  const reload = () => {
    setFailed(false);
    setLoading(true);
    webRef.current?.reload();
  };

  const openOnline = () => {
    setFailed(false);
    setLoading(true);
    setSourceUri(GAME_URL);
  };

  return (
    <View style={styles.root}>
      <RNStatusBar hidden />
      {failed ? (
        <View style={styles.center}>
          <Text style={styles.title}>SEM CONEXÃO COM A ARENA</Text>
          <Text style={styles.body}>A versão local não abriu. O jogo offline continua dentro do APK; a Arena Online usa o servidor e precisa de internet.</Text>
          <Pressable style={styles.btn} onPress={reload}>
            <Text style={styles.btnLabel}>TENTAR DE NOVO</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.onlineBtn]} onPress={openOnline}>
            <Text style={styles.btnLabel}>ABRIR ARENA ONLINE</Text>
          </Pressable>
        </View>
      ) : !mountWebView ? null : (
        <WebView
          ref={webRef}
          source={{ uri: sourceUri }}
          style={styles.web}
          containerStyle={styles.web}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          cacheEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          bounces={false}
          overScrollMode="never"
          scrollEnabled={false}
          setSupportMultipleWindows={false}
          allowFileAccess
          allowFileAccessFromFileURLs
          allowUniversalAccessFromFileURLs
          androidLayerType="software"
          decelerationRate="normal"
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            if (sourceUri === GAME_URL) {
              setSourceUri(LOCAL_GAME_URL);
              setLoading(true);
              return;
            }
            setLoading(false);
            setFailed(true);
          }}
          onHttpError={({ nativeEvent }) => {
            if (nativeEvent.statusCode >= 500 && sourceUri === GAME_URL) {
              setSourceUri(LOCAL_GAME_URL);
              setLoading(true);
            } else if (nativeEvent.statusCode >= 500) { setLoading(false); setFailed(true); }
          }}
          onNavigationStateChange={(nav: WebViewNavigation) => {
            canGoBack.current = nav.canGoBack;
          }}
        />
      )}

      {loading && !failed && (
        <View style={styles.splash} pointerEvents="none">
          <Image
            source={require("../assets/splash-icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ActivityIndicator color={ACCENT} size="large" />
          <Text style={styles.loadingText}>CARREGANDO OS MECHAS…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  web: { flex: 1, backgroundColor: BG },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  logo: { width: 140, height: 140 },
  loadingText: { color: ACCENT, fontSize: 12, letterSpacing: 1 },
  title: { color: ACCENT, fontSize: 15, fontWeight: "700", textAlign: "center" },
  body: { color: "#9fb3c8", fontSize: 13, textAlign: "center" },
  btn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderWidth: 2,
    borderColor: ACCENT,
    backgroundColor: "#0b1a2b",
  },
  onlineBtn: { borderColor: "#ffb21a" },
  btnLabel: { color: "#fff", fontSize: 13, letterSpacing: 1 },
});
