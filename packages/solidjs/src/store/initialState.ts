import {
  infiniteExtent,
  ConnectionMode,
  adoptUserNodes,
  getViewportForBounds,
  Transform,
  updateConnectionLookup,
  devWarn,
  getInternalNodesBounds,
  PanZoomInstance,
  SelectionRect,
  ConnectionStatus,
  ConnectingHandle,
} from '@xyflow/system';

import { FitViewOptions, type Edge, type InternalNode, type Node, type SolidFlowStore } from '../types';
import { Signal, createSignal } from 'solid-js';
import { ReactiveMap } from '@solid-primitives/map';

const getInitialState = ({
  nodes,
  edges,
  defaultNodes,
  defaultEdges,
  width,
  height,
  fitView,
}: {
  nodes?: Node[];
  edges?: Edge[];
  defaultNodes?: Node[];
  defaultEdges?: Edge[];
  width?: number;
  height?: number;
  fitView?: boolean;
} = {}): SolidFlowStore => {
  const nodeLookup = new Map<string, InternalNode>();
  const parentLookup = new Map();
  const connectionLookup = new Map();
  const edgeLookup = new Map();
  const storeEdges = defaultEdges ?? edges ?? [];
  const storeNodes = defaultNodes ?? nodes ?? [];

  updateConnectionLookup(connectionLookup, edgeLookup, storeEdges);
  adoptUserNodes(storeNodes, nodeLookup, parentLookup, {
    nodeOrigin: [0, 0],
    elevateNodesOnSelect: false,
  });

  let transform: Transform = [0, 0, 1];

  if (fitView && width && height) {
    // @todo users nodeOrigin should be used here
    const bounds = getInternalNodesBounds(nodeLookup, {
      nodeOrigin: [0, 0],
      filter: (node) => !!((node.width || node.initialWidth) && (node.height || node.initialHeight)),
    });
    const { x, y, zoom } = getViewportForBounds(bounds, width, height, 0.5, 2, 0.1);
    transform = [x, y, zoom];
  }

  return {
    rfId: new Writable('1'),
    width: new Writable(0),
    height: new Writable(0),
    transform: new Writable(transform),
    nodes: new Writable(storeNodes),
    nodeLookup: new ReactiveMap(),
    parentLookup: new ReactiveMap(),
    edges: new Writable(storeEdges),
    edgeLookup: new ReactiveMap(),
    connectionLookup: new ReactiveMap(),
    onNodesChange: null,
    onEdgesChange: null,
    hasDefaultNodes: new Writable(defaultNodes !== undefined),
    hasDefaultEdges: new Writable(defaultEdges !== undefined),
    panZoom: new Writable<PanZoomInstance | null>(null),
    minZoom: new Writable(0.5),
    maxZoom: new Writable(2),
    translateExtent: new Writable(infiniteExtent),
    nodeExtent: new Writable(infiniteExtent),
    nodesSelectionActive: new Writable(false),
    userSelectionActive: new Writable(false),
    userSelectionRect: new Writable<SelectionRect | null>(null),
    connectionPosition: new Writable({ x: 0, y: 0 }),
    connectionStatus: new Writable<ConnectionStatus | null>(null),
    connectionMode: new Writable<ConnectionMode>(ConnectionMode.Strict),
    domNode: new Writable<HTMLDivElement | null>(null),
    paneDragging: new Writable(false),
    noPanClassName: new Writable('nopan'),
    nodeOrigin: new Writable([0, 0]),
    nodeDragThreshold: new Writable(1),

    snapGrid: new Writable([15, 15]),
    snapToGrid: new Writable(false),

    nodesDraggable: new Writable(true),
    nodesConnectable: new Writable(true),
    nodesFocusable: new Writable(true),
    edgesFocusable: new Writable(true),
    edgesUpdatable: new Writable(true),
    elementsSelectable: new Writable(true),
    elevateNodesOnSelect: new Writable(true),
    elevateEdgesOnSelect: new Writable(false),
    fitViewOnInit: new Writable(false),
    fitViewDone: new Writable(false),
    fitViewOnInitOptions: new Writable<FitViewOptions | undefined>(undefined),
    selectNodesOnDrag: new Writable(true),

    multiSelectionActive: new Writable(false),

    connectionStartHandle: new Writable<ConnectingHandle | null>(null),
    connectionEndHandle: new Writable<ConnectingHandle | null>(null),
    connectionClickStartHandle: new Writable<ConnectingHandle | null>(null),
    connectOnClick: new Writable(true),

    ariaLiveMessage: new Writable(''),
    autoPanOnConnect: new Writable(true),
    autoPanOnNodeDrag: new Writable(true),
    connectionRadius: new Writable(20),
    onError: devWarn,
    isValidConnection: undefined,
    onSelectionChangeHandlers: [],

    lib: new Writable('solid'),
    debug: new Writable(false),
  };
};

export default getInitialState;

export class Writable<T> {

  private s: Signal<T>

  constructor(private initial: T) {
    this.s = createSignal(initial);
  }

  get() {
    return this.s[0]();
  }
  set(v: T) {
    this.s[1](() => {
      return v;
    });
  }
}
