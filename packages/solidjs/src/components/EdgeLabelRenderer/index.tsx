import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useStore } from '../../hooks/useStore';
import type { SolidFlowState } from '../../types';

const selector = (s: SolidFlowState) => s.domNode?.querySelector('.react-flow__edgelabel-renderer');

export function EdgeLabelRenderer({ children }: { children: ReactNode }) {
  const edgeLabelRenderer = useStore(selector);

  if (!edgeLabelRenderer) {
    return null;
  }

  return createPortal(children, edgeLabelRenderer);
}
