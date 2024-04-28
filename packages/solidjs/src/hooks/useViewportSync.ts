import { useEffect } from 'react';
import type { Viewport } from '@xyflow/system';

import { useStore, useStoreApi } from './useStore';
import type { SolidFlowState } from '../types';
import { createEffect } from 'solid-js';

const selector = (state: SolidFlowState) => () => state.panZoom.get()?.syncViewport;

/**
 * Hook for syncing the viewport with the panzoom instance.
 *
 * @internal
 * @param viewport
 */
export function useViewportSync(viewport?: Viewport) {
  const syncViewport = useStore(selector);
  const store = useStoreApi();

  createEffect(() => {
    if (viewport) {
      syncViewport()?.(viewport);
      store.transform.set([viewport.x, viewport.y, viewport.zoom]);
      // store.setState({ transform: [viewport.x, viewport.y, viewport.zoom] });
    }
  });

  return null;
}
