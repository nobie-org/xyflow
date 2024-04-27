import { shallow } from 'zustand/shallow';

import { useStore } from './useStore';
import type { Edge, SolidFlowState } from '../types';

const edgesSelector = (state: SolidFlowState) => state.edges;

/**
 * Hook for getting the current edges from the store.
 *
 * @public
 * @returns An array of edges
 */
export function useEdges<EdgeType extends Edge = Edge>(): EdgeType[] {
  const edges = useStore(edgesSelector, shallow) as EdgeType[];

  return edges;
}
