import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import type { SolidFlowState } from '../../types';
import { useStore } from '../../hooks/useStore';

const selector = (state: SolidFlowState) => state.domNode?.querySelector('.react-flow__renderer');

export function NodeToolbarPortal({ children }: { children: ReactNode }) {
  const wrapperRef = useStore(selector);

  if (!wrapperRef) {
    return null;
  }

  return createPortal(children, wrapperRef);
}
