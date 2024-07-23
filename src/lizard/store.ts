
import { signalStore, withState } from '@ngrx/signals';
import { withChain } from '../components/chain/store.feature';
import { INITIAL_STATE } from './model';

export const LizardStore = signalStore(
  withState(INITIAL_STATE),
  withChain(),
);