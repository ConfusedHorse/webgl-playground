
import { signalStore } from '@ngrx/signals';
import { withRenderer } from '../components/renderer/store.feature';

export const MandelbrotStore = signalStore(
  withRenderer(),
);