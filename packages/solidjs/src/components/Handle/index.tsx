import cc from 'classcat';
import { shallow } from 'zustand/shallow';
import {
  errorMessages,
  Position,
  XYHandle,
  getHostForElement,
  isMouseEvent,
  addEdge,
  type HandleProps,
  type Connection,
  type HandleType,
  ConnectionMode,
} from '@xyflow/system';

import { useStore, useStoreApi } from '../../hooks/useStore';
import { useNodeId } from '../../contexts/NodeIdContext';
import { SolidEvent, type SolidFlowState } from '../../types';
import { createEffect, mergeProps, splitProps, JSX } from 'solid-js';

export interface HandleComponentProps extends HandleProps, Omit<JSX.HTMLAttributes<HTMLDivElement>, 'id'> {}

const selector = (s: SolidFlowState) => ({
  connectOnClick: s.connectOnClick,
  noPanClassName: s.noPanClassName,
  rfId: s.rfId,
});

const connectingSelector =
  (nodeId: string | null, handleId: string | null, type: HandleType) => (state: SolidFlowState) => {
    const {
      connectionStartHandle: startHandle,
      connectionEndHandle: endHandle,
      connectionClickStartHandle: clickHandle,
      connectionMode,
      connectionStatus,
    } = state;

    const connectingTo = endHandle?.nodeId === nodeId && endHandle?.handleId === handleId && endHandle?.type === type;

    return {
      connectingFrom:
        startHandle?.nodeId === nodeId && startHandle?.handleId === handleId && startHandle?.type === type,
      connectingTo,
      clickConnecting:
        clickHandle?.nodeId === nodeId && clickHandle?.handleId === handleId && clickHandle?.type === type,
      isPossibleEndHandle:
        connectionMode === ConnectionMode.Strict
          ? startHandle?.type !== type
          : nodeId !== startHandle?.nodeId || handleId !== startHandle?.handleId,
      connectionInProcess: !!startHandle,
      valid: connectingTo && connectionStatus === 'valid',
    };
  };

function HandleComponent(
  _p: HandleComponentProps
  //   {
  //     type = 'source',
  //     position = Position.Top,
  //     isValidConnection,
  //     isConnectable = true,
  //     isConnectableStart = true,
  //     isConnectableEnd = true,
  //     id,
  //     onConnect,
  //     children,
  //     className,
  //     onMouseDown,
  //     onTouchStart,
  //     ...rest
  //   }: HandleComponentProps,
  //   ref: ForwardedRef<HTMLDivElement>
  // ) {
) {
  const p = mergeProps(
    {
      type: 'source',
      position: Position.Top,
      isValidConnection: undefined,
      isConnectable: true,
      isConnectableStart: true,
      isConnectableEnd: true,
    },
    _p
  );

  const [_, rest] = splitProps(_p, [
    'type',
    'position',
    'isValidConnection',
    'isConnectable',
    'isConnectableStart',
    'isConnectableEnd',
    'id',
    'onConnect',
    'children',
    "class",
    'onMouseDown',
    'onTouchStart',
    'onMouseDown',
    "onTouchStart",

  ]);

  const handleId = () => p.id || null;
  const isTarget = () => p.type === 'target';
  const store = useStoreApi();
  const nodeId = useNodeId();
  const { connectOnClick, noPanClassName, rfId } = useStore(selector, shallow);
  const { connectingFrom, connectingTo, clickConnecting, isPossibleEndHandle, connectionInProcess, valid } = useStore(
    connectingSelector(nodeId, handleId(), p.type),
    shallow
  );

  createEffect(() => {
    if (!nodeId) {
      store().getState().onError?.('010', errorMessages['error010']());
    }
  });

  const onConnectExtended = (params: Connection) => {
    const { defaultEdgeOptions, onConnect: onConnectAction, hasDefaultEdges } = store().getState();

    const edgeParams = {
      ...defaultEdgeOptions,
      ...params,
    };
    if (hasDefaultEdges) {
      const { edges, setEdges } = store().getState();
      setEdges(addEdge(edgeParams, edges));
    }

    onConnectAction?.(edgeParams);
    p.onConnect?.(edgeParams);
  };

  const onPointerDown = (event: MouseEvent | TouchEvent) => {
    if (!nodeId) {
      return;
    }

    const isMouseTriggered = isMouseEvent(event);

    if (p.isConnectableStart && ((isMouseTriggered && (event as MouseEvent).button === 0) || !isMouseTriggered)) {
      const currentStore = store().getState();

      XYHandle.onPointerDown(event, {
        autoPanOnConnect: currentStore.autoPanOnConnect,
        connectionMode: currentStore.connectionMode,
        connectionRadius: currentStore.connectionRadius,
        domNode: currentStore.domNode,
        nodeLookup: currentStore.nodeLookup,
        lib: currentStore.lib,
        isTarget: isTarget(),
        handleId: handleId(),
        nodeId,
        flowId: currentStore.rfId,
        panBy: currentStore.panBy,
        cancelConnection: currentStore.cancelConnection,
        onConnectStart: currentStore.onConnectStart,
        onConnectEnd: currentStore.onConnectEnd,
        updateConnection: currentStore.updateConnection,
        onConnect: onConnectExtended,
        isValidConnection: p.isValidConnection || currentStore.isValidConnection,
        getTransform: () => store().getState().transform,
        getConnectionStartHandle: () => store().getState().connectionStartHandle,
      });
    }

    if (isMouseTriggered) {
      if (typeof p.onMouseDown === 'function') { 

      p.onMouseDown?.(event as SolidEvent<HTMLDivElement, MouseEvent>);
      }
    } else {
      if (typeof p.onTouchStart === 'function') {
      p.onTouchStart?.(event as SolidEvent<HTMLDivElement, TouchEvent>);
      }
    }
  };

  const onClick = (event: MouseEvent) => {
    const {
      onClickConnectStart,
      onClickConnectEnd,
      connectionClickStartHandle,
      connectionMode,
      isValidConnection: isValidConnectionStore,
      lib,
      rfId: flowId,
    } = store().getState();

    if (!nodeId || (!connectionClickStartHandle && !p.isConnectableStart)) {
      return;
    }

    if (!connectionClickStartHandle) {
      onClickConnectStart?.(event, { nodeId, handleId: handleId(), handleType: p.type });
      store().setState({ connectionClickStartHandle: { nodeId, type: p.type, handleId: handleId() } });
      return;
    }

    const doc = getHostForElement(event.target as HTMLElement);
    const isValidConnectionHandler = p.isValidConnection || isValidConnectionStore;
    const { connection, isValid } = XYHandle.isValid(event, {
      handle: {
        nodeId,
        id: handleId(),
        type: p.type,
      },
      connectionMode,
      fromNodeId: connectionClickStartHandle.nodeId,
      fromHandleId: connectionClickStartHandle.handleId || null,
      fromType: connectionClickStartHandle.type,
      isValidConnection: isValidConnectionHandler,
      flowId,
      doc,
      lib,
    });

    if (isValid && connection) {
      onConnectExtended(connection);
    }

    onClickConnectEnd?.(event as unknown as MouseEvent);

    store().setState({ connectionClickStartHandle: null });
  };

  return (
    <div
      data-handleid={handleId()}
      data-nodeid={nodeId}
      data-handlepos={p.position}
      data-id={`${rfId}-${nodeId}-${handleId()}-${p.type}`}
      class={cc([
        'react-flow__handle',
        `react-flow__handle-${p.position}`,
        'nodrag',
        noPanClassName,
        p.class,
        {
          source: !isTarget,
          target: isTarget,
          connectable: p.isConnectable,
          connectablestart: p.isConnectableStart,
          connectableend: p.isConnectableEnd,
          clickconnecting: clickConnecting,
          connectingfrom: connectingFrom,
          connectingto: connectingTo,
          valid,
          // shows where you can start a connection from
          // and where you can end it while connecting
          connectionindicator:
            p.isConnectable &&
            (!connectionInProcess || isPossibleEndHandle) &&
            (connectionInProcess ? p.isConnectableEnd : p.isConnectableStart),
        },
      ])}
      onMouseDown={onPointerDown}
      onTouchStart={onPointerDown}
      onClick={connectOnClick ? onClick : undefined}
      ref={p.ref}
      {...rest}
    >
      {p.children}
    </div>
  );
}

/**
 * The Handle component is a UI element that is used to connect nodes.
 */
export const Handle = HandleComponent;


// type Event = 
