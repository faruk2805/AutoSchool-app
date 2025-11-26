import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2086F6" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        
        {/* 🔹 DODAJ OVE GRUPNE RUTE */}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(instructor)" />
        
        <Stack.Screen name="modal" />
        <Stack.Screen name="test-screen" />
        <Stack.Screen name="LekcijskiPrvaPomoc" />
        <Stack.Screen name="prva-pomoc/index" />
        <Stack.Screen name="prva-pomoc/lekcije" />
        <Stack.Screen name="prva-pomoc/lekcija" />
        <Stack.Screen name="prva-pomoc/nasumicni-test" />
        <Stack.Screen name="prva-pomoc/test-screen" />
        <Stack.Screen name="teorija-voznje/index" />
        <Stack.Screen name="teorija-voznje/lekcije" />
        <Stack.Screen name="teorija-voznje/lekcija" />
        <Stack.Screen name="teorija-voznje/nasumicni-test" />
        <Stack.Screen name="teorija-voznje/test-screen" />
        <Stack.Screen name="saobracajni-znakovi/index" />
        <Stack.Screen name="saobracajni-znakovi/lekcije" />
        <Stack.Screen name="saobracajni-znakovi/lekcija" />
        <Stack.Screen name="saobracajni-znakovi/nasumicni-test" />
        <Stack.Screen name="saobracajni-znakovi/test-screen" />
        <Stack.Screen name="raskrsnice/index" />
        <Stack.Screen name="raskrsnice/lekcije" />
        <Stack.Screen name="raskrsnice/lekcija" />
        <Stack.Screen name="raskrsnice/nasumicni-test" />
        <Stack.Screen name="raskrsnice/test-screen" />
      </Stack>
    </>
  );
}