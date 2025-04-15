
import { signalStore, withFeature } from '@ngrx/signals';
import { withRenderer } from '../components/renderer/store.feature';

export const MandelbrotStore = signalStore(
  withFeature(withRenderer),
);