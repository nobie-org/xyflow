
import { useStoreApi } from './useStore';
import type { OnSelectionChangeFunc } from '../types';
import { createEffect } from 'solid-js';

export type UseOnSelectionChangeOptions = {
  onChange: OnSelectionChangeFunc;
};

/**
 * Hook for registering an onSelectionChange handler.
 *
 * @public
 * @param params.onChange - The handler to register
 */
export function useOnSelectionChange(p:UseOnSelectionChangeOptions) {
  const store = useStoreApi();

  createEffect(() => {
    const nextOnSelectionChangeHandlers = [...store().getState().onSelectionChangeHandlers, p.onChange];
    store().setState({ onSelectionChangeHandlers: nextOnSelectionChangeHandlers });

    return () => {
      const nextHandlers = store().getState().onSelectionChangeHandlers.filter((fn) => fn !== p.onChange);
      store().setState({ onSelectionChangeHandlers: nextHandlers });
    };
  })
}
