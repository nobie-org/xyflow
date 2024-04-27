// import { CSSProperties, useCallback } from 'react';
// import { shallow } from 'zustand/shallow';
import cc from 'classcat';
import {
  Position,
  ConnectionLineType,
  ConnectionMode,
  getBezierPath,
  getSmoothStepPath,
  type ConnectionStatus,
  type HandleType,
} from '@xyflow/system';

import { useStore } from '../../hooks/useStore';
import { getSimpleBezierPath } from '../Edges/SimpleBezierEdge';
import type { ConnectionLineComponent, ReactFlowState, SolidFlowStore } from '../../types';
import { Show, mergeProps, JSX } from 'solid-js';

type ConnectionLineProps = {
  nodeId: string;
  handleType: HandleType;
  type: ConnectionLineType;
  style?: JSX.CSSProperties;
  CustomComponent?: ConnectionLineComponent;
  connectionStatus: ConnectionStatus | null;
};

const oppositePosition = {
  [Position.Left]: Position.Right,
  [Position.Right]: Position.Left,
  [Position.Top]: Position.Bottom,
  [Position.Bottom]: Position.Top,
};

const ConnectionLine = (_p: ConnectionLineProps) => {
  //   nodeId,
  //   handleType,
  //   style,
  //   type = ConnectionLineType.Bezier,
  //   CustomComponent,
  //   connectionStatus,
  // }: ConnectionLineProps) => {
  const p = mergeProps({ type: ConnectionLineType.Bezier }, _p);

  const { fromNode, handleId, toX, toY, connectionMode } = useStore((s: SolidFlowStore) => ({
    fromNode: s.nodeLookup.get(p.nodeId),
    handleId: s.connectionStartHandle?.handleId,
    toX: (s.connectionPosition.x - s.transform[0]) / s.transform[2],
    toY: (s.connectionPosition.y - s.transform[1]) / s.transform[2],
    connectionMode: s.connectionMode,
  }));
  // p.shallow
  const fromHandleBounds = () => fromNode?.internals.handleBounds;
  const handleBounds = () => {
    const x = fromHandleBounds()?.[p.handleType];
    if (connectionMode === ConnectionMode.Loose) {
      return x ? x : fromHandleBounds()?.[p.handleType === 'source' ? 'target' : 'source'];
    } else {
      return x;
    }
  };

  // if (connectionMode === ConnectionMode.Loose) {
  //   handleBounds = handleBounds() ? handleBounds : fromHandleBounds?.[handleType === 'source' ? 'target' : 'source'];
  // }

  // if (!fromNode || !handleBounds) {
  //   return null;
  // }

  const fromHandle = () => (handleId ? handleBounds()?.find((d) => d.id === handleId) : handleBounds()?.[0]);
  const fromHandleX = () => {
    const handle = fromHandle();
    if (handle) {
      return handle.x + handle.width / 2;
    } else {
      return fromNode?.measured.width ?? 0 / 2;
    }
  };
  const fromHandleY = () => {
    const handle = fromHandle();
    if (handle) {
      return handle.y + handle.height / 2;
    } else {
      return fromNode?.measured.height ?? 0 / 2;
    }
  };
  const fromX = () => fromNode?.internals?.positionAbsolute?.x || 0 + fromHandleX();
  const fromY = () => fromNode?.internals?.positionAbsolute?.y || 0 + fromHandleY();
  const fromPosition = () => fromHandle()?.position;
  const toPosition = () => (fromPosition() ? oppositePosition[fromPosition()!] : null);


  const DefaultComponent = () => {
    const makeDAttr = () => {
      let dAttr = '';

      const pathParams = {
        sourceX: fromX(),
        sourceY: fromY(),
        sourcePosition: fromPosition()!,
        targetX: toX,
        targetY: toY,
        targetPosition: toPosition()!,
      };

      if (p.type === ConnectionLineType.Bezier) {
        // we assume the destination position is opposite to the source position
        [dAttr] = getBezierPath(pathParams);
      } else if (p.type === ConnectionLineType.Step) {
        [dAttr] = getSmoothStepPath({
          ...pathParams,
          borderRadius: 0,
        });
      } else if (p.type === ConnectionLineType.SmoothStep) {
        [dAttr] = getSmoothStepPath(pathParams);
      } else if (p.type === ConnectionLineType.SimpleBezier) {
        [dAttr] = getSimpleBezierPath(pathParams);
      } else {
        dAttr = `M${fromX()},${fromY()} ${toX},${toY}`;
      }

      return dAttr;
    };

    return <path d={makeDAttr()} fill="none" class="react-flow__connection-path" style={p.style} />;
  };

  return (
    <Show when={fromNode && handleBounds() && fromPosition() && toPosition()}>
      <Show when={p.CustomComponent} keyed fallback={<DefaultComponent />}>
        {(CustomComponent) => {
          return (
            <CustomComponent
              connectionLineType={p.type}
              connectionLineStyle={p.style}
              fromNode={fromNode}
              fromHandle={fromHandle()}
              fromX={fromX()}
              fromY={fromY()}
              toX={toX}
              toY={toY}
              fromPosition={fromPosition()!}
              toPosition={toPosition()!}
              connectionStatus={p.connectionStatus}
            />
          );
        }}
      </Show>
    </Show>
  );

  // if (CustomComponent) {
  //   return (
  //     <CustomComponent
  //       connectionLineType={type}
  //       connectionLineStyle={style}
  //       fromNode={fromNode}
  //       fromHandle={fromHandle}
  //       fromX={fromX}
  //       fromY={fromY}
  //       toX={toX}
  //       toY={toY}
  //       fromPosition={fromPosition}
  //       toPosition={toPosition}
  //       connectionStatus={connectionStatus}
  //     />
  //   );
  // }
};

ConnectionLine.displayName = 'ConnectionLine';

type ConnectionLineWrapperProps = {
  type: ConnectionLineType;
  component?: ConnectionLineComponent;
  containerStyle?: JSX.CSSProperties;
  style?: JSX.CSSProperties;
};

const selector = (s: ReactFlowState) => ({
  nodeId: s.connectionStartHandle?.nodeId,
  handleType: s.connectionStartHandle?.type,
  nodesConnectable: s.nodesConnectable,
  connectionStatus: s.connectionStatus,
  width: s.width,
  height: s.height,
});

export function ConnectionLineWrapper(p: ConnectionLineWrapperProps) {
  // { containerStyle, style, type, component }: ConnectionLineWrapperProps) {

  const { nodeId, handleType, nodesConnectable, width, height, connectionStatus } = useStore(selector);

  const innerProps = () => {
    const isValid = !!(nodeId && handleType && width && nodesConnectable);
    if (!isValid) {
      return null;
    }
    return {
      nodeId,
      handleType,
      type: p.type,
      style: p.style,
      CustomComponent: p.component,
      connectionStatus,
    };
  };

  return (
    <Show when={innerProps()}>
      {(props) => {
        return (
          <svg
            style={p.containerStyle}
            width={width}
            height={height}
            class="react-flow__connectionline react-flow__container"
          >
            <g class={cc(['react-flow__connection', connectionStatus])}>
              <ConnectionLine
                nodeId={props().nodeId}
                handleType={props().handleType}
                style={props().style}
                type={props().type}
                CustomComponent={props().CustomComponent}
                connectionStatus={connectionStatus}
              />
            </g>
          </svg>
        );
      }}
    </Show>
  );
}
