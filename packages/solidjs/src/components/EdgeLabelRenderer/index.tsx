import type { ReactNode } from 'react';
// import { createPortal } from 'react-dom';

import { useStore } from '../../hooks/useStore';
import type { SolidFlowState } from '../../types';
import { Portal } from 'solid-js/web'
import { ParentProps } from 'solid-js';

const selector = (s: SolidFlowState) => () => s.domNode.get()?.querySelector('.react-flow__edgelabel-renderer');

export function EdgeLabelRenderer(p: ParentProps)) {
  const edgeLabelRenderer = useStore(selector);

  if (!edgeLabelRenderer) {
    return null;
  }

  return <Portal mount={edgeLabelRenderer()}>
    {p.children}

  </Portal>
  return createPortal(children, edgeLabelRenderer);
}
