import { memo } from 'react';
import { Position, getSmoothStepPath } from '@xyflow/system';

import { BaseEdge } from './BaseEdge';
import type { SmoothStepEdgeProps } from '../../types';

function createSmoothStepEdge(params: { isInternal: boolean }) {
  // eslint-disable-next-line react/display-name
  return memo(
    ({
      id,
      sourceX,
      sourceY,
      targetX,
      targetY,
      label,
      labelStyle,
      labelShowBg,
      labelBgStyle,
      labelBgPadding,
      labelBgBorderRadius,
      style,
      sourcePosition = Position.Bottom,
      targetPosition = Position.Top,
      markerEnd,
      markerStart,
      pathOptions,
      interactionWidth,
    }: SmoothStepEdgeProps) => {
      const [path, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: pathOptions?.borderRadius,
        offset: pathOptions?.offset,
      });

      const _id = params.isInternal ? undefined : id;

      return (
        <BaseEdge
          id={_id}
          path={path}
          labelX={labelX}
          labelY={labelY}
          label={label}
          labelStyle={labelStyle}
          labelShowBg={labelShowBg}
          labelBgStyle={labelBgStyle}
          labelBgPadding={labelBgPadding}
          labelBgBorderRadius={labelBgBorderRadius}
          style={style}
          markerEnd={markerEnd}
          markerStart={markerStart}
          interactionWidth={interactionWidth}
        />
      );
    }
  );
}

const SmoothStepEdge = createSmoothStepEdge({ isInternal: false });
const SmoothStepEdgeInternal = createSmoothStepEdge({ isInternal: true });

SmoothStepEdge.displayName = 'SmoothStepEdge';
SmoothStepEdgeInternal.displayName = 'SmoothStepEdgeInternal';

export { SmoothStepEdge, SmoothStepEdgeInternal };
