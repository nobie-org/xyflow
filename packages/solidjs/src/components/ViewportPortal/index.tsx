import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useStore } from '../../hooks/useStore';
import type { SolidFlowState } from '../../types';

const selector = (s: SolidFlowState) => s.domNode?.querySelector('.react-flow__viewport-portal');

export function ViewportPortal({ children }: { children: ReactNode }) {
  const viewPortalDiv = useStore(selector);

  if (!viewPortalDiv) {
    return null;
  }

  return createPortal(children, viewPortalDiv);
}
