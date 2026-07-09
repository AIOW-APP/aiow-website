/* Haptische micro-momenten (Bisnix-les, zelfde drie registers als de
 * Tisnix-app; meer smaken maken het betekenisloos):
 *  - tik: elke bewuste druk (selection, nauwelijks voelbaar, bevestigt contact)
 *  - succes: een afgeronde stap met gevolg (weegmoment, verstuurd, verdict)
 *  - waarschuw: iets vraagt echt aandacht (validatiefout)
 * expo-haptics ontbreekt op web en in sommige Expo Go-builds; alles faalt stil. */

let H: typeof import('expo-haptics') | null = null;
try {
  H = require('expo-haptics');
} catch {
  H = null;
}

export const voel = {
  tik(): void {
    void H?.selectionAsync().catch(() => {});
  },
  succes(): void {
    void H?.notificationAsync(H.NotificationFeedbackType.Success).catch(() => {});
  },
  waarschuw(): void {
    void H?.notificationAsync(H.NotificationFeedbackType.Warning).catch(() => {});
  },
};
