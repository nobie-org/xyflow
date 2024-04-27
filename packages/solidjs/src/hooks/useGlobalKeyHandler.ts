import { useEffect } from 'react';
import type { KeyCode } from '@xyflow/system';

import { useStoreApi } from './useStore';
import { useKeyPress, UseKeyPressOptions } from './useKeyPress';
import { useSolidFlow } from './useReactFlow';
import { Edge, Node } from '../types';

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

  useEffect(() => {
    if (deleteKeyPressed) {
      const { edges, nodes } = store.getState();
      deleteElements({ nodes: nodes.filter(selected), edges: edges.filter(selected) });
      store.setState({ nodesSelectionActive: false });
    }
  }, [deleteKeyPressed]);

  useEffect(() => {
    store.setState({ multiSelectionActive: multiSelectionKeyPressed });
  }, [multiSelectionKeyPressed]);
}
