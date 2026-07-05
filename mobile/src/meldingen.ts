/* Pushmelding op het moment van het verdict: het bestaansrecht van deze app
 * (report §5: je uitslag als event, niet als mailtje). v1 zonder backend werkt
 * met een lokale notificatie die valt op het moment dat het verdict valt; zodra
 * er een echt endpoint is, vervangt een server-push dit en blijft de flow gelijk.
 * expo-notifications ontbreekt op web; alles faalt stil (zelfde patroon als voel). */

let N: typeof import('expo-notifications') | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  N = require('expo-notifications');
} catch {
  N = null;
}

let handlerGezet = false;

/* Vraag toestemming pas na een bewuste druk (geen permissie-overval bij start).
 * Retourneert of meldingen aan staan. */
export async function meldingAanzetten(): Promise<boolean> {
  if (!N) return false;
  try {
    if (!handlerGezet) {
      /* Toon de melding ook als de app open staat: het verdict is het moment. */
      N.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      handlerGezet = true;
    }
    const huidig = await N.getPermissionsAsync();
    if (huidig.granted) return true;
    const gevraagd = await N.requestPermissionsAsync();
    return gevraagd.granted;
  } catch {
    return false;
  }
}

/* De verdict-melding zelf, op het moment dat het verdict valt. */
export async function verdictMelding(titel: string, tekst: string): Promise<void> {
  if (!N) return;
  try {
    await N.scheduleNotificationAsync({
      content: { title: titel, body: tekst },
      trigger: null,
    });
  } catch {
    /* stil: de in-app verdict-sectie is de bron van waarheid */
  }
}
