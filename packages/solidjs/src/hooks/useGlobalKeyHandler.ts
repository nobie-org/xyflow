import type { KeyCode } from '@xyflow/system';

import { useStoreApi } from './useStore';
import { useKeyPress, UseKeyPressOptions } from './useKeyPress';
import { useSolidFlow } from './useReactFlow';
import { Edge, Node } from '../types';
import { createEffect } from 'solid-js';

const selected = (item: Node | Edge) => item.selected;

const deleteKeyOptions: UseKeyPressOptions = { actInsideInputWithModifier: false };

/**
 * Hook for handling global key events.
 *
 * @internal
 */
export function useGlobalKeyHandler({
  deleteKeyCode,
  multiSelectionKeyCode,
}: {
  deleteKeyCode: KeyCode | null;
  multiSelectionKeyCode: KeyCode | null;
}): void {
  const store = useStoreApi();
  const { deleteElements } = useSolidFlow();

  const deleteKeyPressed = useKeyPress(deleteKeyCode, deleteKeyOptions);
  const multiSelectionKeyPressed = useKeyPress(multiSelectionKeyCode);

  createEffect(() => {
    if (deleteKeyPressed()) {
      const { edges, nodes } = store;
      deleteElements({ nodes: nodes.get().filter(selected), edges: edges.get().filter(selected) });
      store.nodesSelectionActive.set(false);
    }
  });

  createEffect(() => {
    store.multiSelectionActive.set(multiSelectionKeyPressed())
  });
}
