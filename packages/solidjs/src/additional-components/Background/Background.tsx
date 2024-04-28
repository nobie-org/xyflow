import { JSX, Show, splitProps } from 'solid-js';
import cc from 'classcat';

import { useStore } from '../../hooks/useStore';
import { DotPattern, LinePattern } from './Patterns';
import { containerStyle } from '../../styles/utils';
import { type BackgroundProps, BackgroundVariant } from './types';
import { type SolidFlowState } from '../../types';
import { useRef } from '../../utils/hooks';

const defaultSize = {
  [BackgroundVariant.Dots]: 1,
  [BackgroundVariant.Lines]: 1,
  [BackgroundVariant.Cross]: 6,
};

const selector = (s: SolidFlowState) => ({ transform: s.transform, patternId: `pattern-${s.rfId}` });

function BackgroundComponent(_p: BackgroundProps) {
  const lineWidth = () => _p.lineWidth || 1;
  const offset = () => _p.offset || 2;
  const gap = () => _p.gap || 20;
  const variant = () => _p.variant || BackgroundVariant.Dots;

  const [_ignored, p] = splitProps(_p, ['gap', 'lineWidth', 'offset', 'variant']);

  const ref = useRef<SVGSVGElement | null>(null);
  const { transform, patternId } = useStore(selector);
  const patternSize = () => p.size || defaultSize[variant()];
  const isDots = () => variant() === BackgroundVariant.Dots;
  const isCross = () => variant() === BackgroundVariant.Cross;
  const gapXY = () => {
    const g = gap();
    if (Array.isArray(g)) {
      return g;
    } else {
      return [g, g];
    }
  };
  const scaledGap: () => [number, number] = () => [gapXY()[0] * transform.get()[2] || 1, gapXY()[1] * transform.get()[2] || 1];
  const scaledSize = () => patternSize() * transform.get()[2];

  const patternDimensions: () => [number, number] = () => (isCross() ? [scaledSize(), scaledSize()] : scaledGap());

  const patternOffset = () => {
    if (isDots()) {
      return [scaledSize() / offset(), scaledSize() / offset()];
    } else {
      return [patternDimensions()[0] / offset(), patternDimensions()[1] / offset()];
    }
  };

  const _patternId = () => `${patternId}${p.id ? p.id : ''}`;

  const style = (): JSX.CSSProperties => {
    return {
      ...p.style,
      ...containerStyle,
      '--xy-background-color-props': p.bgColor,
      '--xy-background-pattern-color-props': p.color,
    } as JSX.CSSProperties;
  };

  return (
    <svg
      class={cc(['react-flow__background', p.className])}
      style={style()}
      ref={(el) => (ref.current = el)}
      data-testid="rf__background"
    >
      <pattern
        id={_patternId()}
        x={transform.get()[0] % scaledGap()[0]}
        y={transform.get()[1] % scaledGap()[1]}
        width={scaledGap()[0]}
        height={scaledGap()[1]}
        patternUnits="userSpaceOnUse"
        patternTransform={`translate(-${patternOffset()[0]},-${patternOffset()[1]})`}
      >
        <Show
          when={isDots()}
          fallback={
            <LinePattern
              dimensions={patternDimensions()}
              lineWidth={lineWidth()}
              variant={variant()}
              className={p.patternClassName}
            />
          }
        >
          <DotPattern radius={scaledSize() / offset()} className={p.patternClassName} />
        </Show>
      </pattern>
      <rect x="0" y="0" width="100%" height="100%" fill={`url(#${_patternId()})`} />
    </svg>
  );
}

BackgroundComponent.displayName = 'Background';

export const Background = BackgroundComponent;
