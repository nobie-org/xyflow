/*
 * This component helps us to update the store with the vlues coming from the user.
 * We distinguish between values we can update directly with `useDirectStoreUpdater` (like `snapGrid`)
 * and values that have a dedicated setter function in the store (like `setNodes`).
 */
// import { useEffect, useRef } from 'react';
// import { shallow } from 'zustand/shallow';
import { infiniteExtent, type CoordinateExtent } from '@xyflow/system';

import { useStore, useStoreApi } from '../../hooks/useStore';
import type { Node, Edge, SolidFlowState, ReactFlowProps, FitViewOptions } from '../../types';
import { defaultNodeOrigin } from '../../container/ReactFlow/init-values';
import { useRef } from '../../utils/hooks';
import { createEffect, onCleanup } from 'solid-js';
import { Writable } from '../../store/initialState';

// these fields exist in the global store and we need to keep them up to date
const reactFlowFieldsToTrack = [
  'nodes',
  'edges',
  'defaultNodes',
  'defaultEdges',
  'onConnect',
  'onConnectStart',
  'onConnectEnd',
  'onClickConnectStart',
  'onClickConnectEnd',
  'nodesDraggable',
  'nodesConnectable',
  'nodesFocusable',
  'edgesFocusable',
  'edgesUpdatable',
  'elevateNodesOnSelect',
  'elevateEdgesOnSelect',
  'minZoom',
  'maxZoom',
  'nodeExtent',
  'onNodesChange',
  'onEdgesChange',
  'elementsSelectable',
  'connectionMode',
  'snapGrid',
  'snapToGrid',
  'translateExtent',
  'connectOnClick',
  'defaultEdgeOptions',
  'fitView',
  'fitViewOptions',
  'onNodesDelete',
  'onEdgesDelete',
  'onDelete',
  'onNodeDrag',
  'onNodeDragStart',
  'onNodeDragStop',
  'onSelectionDrag',
  'onSelectionDragStart',
  'onSelectionDragStop',
  'onMoveStart',
  'onMove',
  'onMoveEnd',
  'noPanClassName',
  'nodeOrigin',
  'autoPanOnConnect',
  'autoPanOnNodeDrag',
  'onError',
  'connectionRadius',
  'isValidConnection',
  'selectNodesOnDrag',
  'nodeDragThreshold',
  'onBeforeDelete',
  'debug',
] as const;

type ReactFlowFieldsToTrack = (typeof reactFlowFieldsToTrack)[number];
type StoreUpdaterProps<NodeType extends Node = Node, EdgeType extends Edge = Edge> = Pick<
  ReactFlowProps<NodeType, EdgeType>,
  ReactFlowFieldsToTrack
> & {
  rfId: string;
};

// rfId doesn't exist in ReactFlowProps, but it's one of the fields we want to update
const fieldsToTrack = [...reactFlowFieldsToTrack, 'rfId'] as const;

const selector = (s: SolidFlowState) => ({
  setNodes: s.setNodes,
  setEdges: s.setEdges,
  setMinZoom: s.setMinZoom,
  setMaxZoom: s.setMaxZoom,
  setTranslateExtent: s.setTranslateExtent,
  setNodeExtent: s.setNodeExtent,
  reset: s.reset,
  setDefaultNodesAndEdges: s.setDefaultNodesAndEdges,
});

const initPrevValues = {
  // these are values that are also passed directly to other components
  // than the StoreUpdater. We can reduce the number of setStore calls
  // by setting the same values here as prev fields.
  translateExtent: infiniteExtent,
  nodeOrigin: defaultNodeOrigin,
  minZoom: 0.5,
  maxZoom: 2,
  elementsSelectable: true,
  noPanClassName: 'nopan',
  rfId: '1',
};

export function StoreUpdater<NodeType extends Node = Node, EdgeType extends Edge = Edge>(
  props: StoreUpdaterProps<NodeType, EdgeType>
) {
  const {
    setNodes,
    setEdges,
    setMinZoom,
    setMaxZoom,
    setTranslateExtent,
    setNodeExtent,
    reset,
    setDefaultNodesAndEdges,
  } = useStore(selector);
  const store = useStoreApi<NodeType, EdgeType>();

  console.log("storeUpdater called");

  createEffect(() => {
    setDefaultNodesAndEdges(props.defaultNodes, props.defaultEdges);

    onCleanup(() => {
      // when we reset the store we also need to reset the previous fields
      previousFields.current = initPrevValues;
      reset();
    });
  });

  const previousFields = useRef<Partial<StoreUpdaterProps<NodeType, EdgeType>>>(initPrevValues);

  createEffect(
    () => {
      console.log("props", props)
      for (const fieldName of fieldsToTrack) {
        console.log("fieldName", fieldName)

        const fieldValue = props[fieldName];
        console.log("fieldValue", fieldValue)
        const previousFieldValue = previousFields.current[fieldName];

        if (fieldValue === previousFieldValue) continue;
        if (typeof props[fieldName] === 'undefined') continue;
        // Custom handling with dedicated setters for some fields
        if (fieldName === 'nodes') setNodes(fieldValue as Node[]);
        else if (fieldName === 'edges') setEdges(fieldValue as Edge[]);
        else if (fieldName === 'minZoom') setMinZoom(fieldValue as number);
        else if (fieldName === 'maxZoom') setMaxZoom(fieldValue as number);
        else if (fieldName === 'translateExtent') setTranslateExtent(fieldValue as CoordinateExtent);
        else if (fieldName === 'nodeExtent') setNodeExtent(fieldValue as CoordinateExtent);
        // Renamed fields
        else if (fieldName === 'fitView') store.fitViewOnInit.set(fieldValue as boolean);
        else if (fieldName === 'fitViewOptions') store.fitViewOnInitOptions.set(fieldValue as FitViewOptions);
        // General case
        else {

          if (fieldName === "defaultNodes") { 
            console.warn("defaultNodes is not a valid field to track");
            continue
          }
          if (fieldName === "defaultEdges") {
            console.warn("defaultEdges is not a valid field to track");
            continue
          }

          
          const maybeWritable = store[fieldName];
          if (maybeWritable instanceof Writable) { 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const w = maybeWritable as Writable<any>;
            w.set(fieldValue);
          } else { 
            console.warn(`Field ${fieldName} is not writable`);
            // throw new Error(`Field ${fieldName} is not writable`);
          }
        } 
      }

      previousFields.current = { ...props }
    },
    // Only re-run the effect if one of the fields we track changes
    // fieldsToTrack.map((fieldName) => props[fieldName])
  );

  return null;
}
