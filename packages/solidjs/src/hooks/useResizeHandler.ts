import { errorMessages, getDimensions } from '@xyflow/system';

import { useStoreApi } from './useStore';
import { createEffect } from 'solid-js';

/**
 * Hook for handling resize events.
 *
 * @internal
 */
export function useResizeHandler(domNode: HTMLDivElement | null): void {
  const store = useStoreApi();

  createEffect(() => {
    const updateDimensions = () => {
      if (!domNode) {
        return false;
      }
      const size = getDimensions(domNode);

      if (size.height === 0 || size.width === 0) {
        store.onError?.('004', errorMessages['error004']());
      }

      store.batch((store) => {
        store.width.set(size.width || 500);
        store.height.set(size.height || 500);
      })

    };

    if (domNode) {
      updateDimensions();
      window.addEventListener('resize', updateDimensions);

      const resizeObserver = new ResizeObserver(() => updateDimensions());
      resizeObserver.observe(domNode);

      return () => {
        window.removeEventListener('resize', updateDimensions);

        if (resizeObserver && domNode) {
          resizeObserver.unobserve(domNode);
        }
      };
    }
  });
}
