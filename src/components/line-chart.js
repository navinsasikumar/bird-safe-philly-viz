import * as React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import {
  AnimatedAxis,
  AnimatedGrid,
  AnimatedLineSeries,
  XYChart,
  Tooltip,
} from '@visx/xychart';


const accessors = {
  xAccessor: d => d.date,
  yAccessor: d => d.count,
};

export default function LineChart({ data, height }) {
  return (
    <XYChart height={height} xScale={{ type: 'time' }} yScale={{ type: 'linear' }}>
      <AnimatedAxis orientation="bottom" />
      <AnimatedAxis orientation="left" />
      <AnimatedGrid columns={false} numTicks={4} />
      <AnimatedLineSeries dataKey="Window Strikes" data={data} {...accessors} />
      <Tooltip
        snapTooltipToDatumX
        snapTooltipToDatumY
        showVerticalCrosshair
        showSeriesGlyphs
        renderTooltip={({ tooltipData, colorScale }) => (
          <div>
            <div style={{ color: colorScale(tooltipData.nearestDatum.key) }}>
              {tooltipData.nearestDatum.key}
            </div>
            {format(accessors.xAccessor(tooltipData.nearestDatum.datum), 'MMM d')}
            {': '}
            {accessors.yAccessor(tooltipData.nearestDatum.datum)}
          </div>
        )}
      />
    </XYChart>
  );
}

LineChart.propTypes = {
  data: PropTypes.array.isRequired,
  height: PropTypes.number.isRequired,
};
