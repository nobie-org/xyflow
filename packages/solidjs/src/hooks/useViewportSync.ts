import { useEffect } from 'react';
import type { Viewport } from '@xyflow/system';

import { useStore, useStoreApi } from './useStore';
import type { SolidFlowState } from '../types';

const selector = (state: SolidFlowState) => state.panZoom?.syncViewport;

/**
 * Hook for syncing the viewport with the panzoom instance.
 *
 * @internal
 * @param viewport
 */
export function useViewportSync(viewport?: Viewport) {
  const syncViewport = useStore(selector);
  const store = useStoreApi();

  useEffect(() => {
    if (viewport) {
      syncViewport?.(viewport);
      store.setState({ transform: [viewport.x, viewport.y, viewport.zoom] });
    }
  }, [viewport, syncViewport]);

  return null;
}
