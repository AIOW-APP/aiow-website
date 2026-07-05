/* Reduced-motion is teamwet: alles staat stil en is compleet, eindstand direct.
 * Module-singleton zodat elke Animated-helper het synchroon kan raadplegen. */

import { AccessibilityInfo } from 'react-native';

let verminderd = false;

AccessibilityInfo.isReduceMotionEnabled()
  .then((v) => {
    verminderd = v;
  })
  .catch(() => {});

AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => {
  verminderd = v;
});

export const bewegingVerminderd = (): boolean => verminderd;
