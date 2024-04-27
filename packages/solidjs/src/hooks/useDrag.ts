import { XYDrag, type XYDragInstance } from '@xyflow/system';

import { handleNodeClick } from '../components/Nodes/utils';
import { useStoreApi } from './useStore';
import { createEffect, createSignal } from 'solid-js';
import { useRef } from '../utils/hooks';

type UseDragParams = {
  nodeRef: HTMLDivElement;
  disabled?: boolean;
  noDragClassName?: string;
  handleSelector?: string;
  nodeId?: string;
  isSelectable?: boolean;
};

/**
 * Hook for calling XYDrag helper from @xyflow/system.
 *
 * @internal
 */
export function useDrag({
  nodeRef,
  disabled = false,
  noDragClassName,
  handleSelector,
  nodeId,
  isSelectable,
}: UseDragParams) {
  const store = useStoreApi();
  const [dragging, setDragging] = createSignal<boolean>(false);
  const xyDrag = useRef<XYDragInstance | undefined>(undefined);

  createEffect(() => {
    xyDrag.current = XYDrag({

      getStoreItems: () => {
        return {
          nodes: store.nodes.get(),
          nodeLookup: store.nodeLookup,
          edges: store.edges.get(),
          nodeExtent: store.nodeExtent.get(),
          snapGrid: store.snapGrid.get(),
          snapToGrid: store.snapToGrid.get(),
          nodeOrigin: store.nodeOrigin.get(),
          multiSelectionActive: store.multiSelectionActive.get(),
          domNode: store.domNode.get(),
          transform: store.transform.get(),
          autoPanOnNodeDrag: store.autoPanOnNodeDrag.get(),
          nodesDraggable: store.nodesDraggable.get(),
          selectNodesOnDrag: store.selectNodesOnDrag.get(),
          nodeDragThreshold: store.nodeDragThreshold.get(),
          unselectNodesAndEdges: store.unselectNodesAndEdges,
          updateNodePositions: store.updateNodePositions,
          panBy: store.panBy
        };
      },

      onNodeMouseDown: (id: string) => {
        handleNodeClick({
          id,
          store,
          nodeRef,
        });
      },
      onDragStart: () => {
        setDragging(true);
      },
      onDragStop: () => {
        setDragging(false);
      },
    });
  });

  createEffect(() => {
    if (disabled) {
      xyDrag.current?.destroy();
    } else if (nodeRef) {
      xyDrag.current?.update({
        noDragClassName,
        handleSelector,
        domNode: nodeRef,
        isSelectable,
        nodeId,
      });
      return () => {
        xyDrag.current?.destroy();
      };
    }
  });

  return dragging;
}
