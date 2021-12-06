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
import { scaleOrdinal } from '@visx/scale';
import { LegendOrdinal } from '@visx/legend';

const accessors = {
  xAccessor: d => d.date,
  yAccessor: d => d.count,
};

const getSpeciesListforDay = (speciesList) => {
  if (!speciesList) return '';
  const arr = Object.keys(speciesList).map(species => (
    { species, count: speciesList[species].length }
  ));
  const sorted = arr.sort((a, b) => b.count - a.count);
  return sorted.map(k => `${k.species}: ${k.count}`).join(', ');
};

export default function LineChart({
  data, height, xTicks, yTicks,
}) {
  const total = data.reduce((a, r) => a + r.count, 0);
  const totalScale = scaleOrdinal({
    domain: [`Total: ${total}`],
    range: ['#0b7285'],
  });

  return (
    <>
    <div
      style={{
        display: 'flex',
        justifyContent: 'right',
        fontSize: '12px',
        marginRight: '40px',
        position: 'relative',
        top: '40px',
      }}
    >
      <LegendOrdinal scale={totalScale} direction="row" labelMargin="0 15px 0 0 " />
    </div>
    <XYChart height={height} xScale={{ type: 'time' }} yScale={{ type: 'linear' }}>
      <AnimatedAxis orientation="bottom" label="Dates" numTicks={xTicks} />
      <AnimatedAxis
        orientation="left"
        label="Window Strikes"
        numTicks={yTicks}
      />
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
            <div>
              {getSpeciesListforDay(data[tooltipData.nearestDatum.index].species)}
            </div>
          </div>
        )}
      />
    </XYChart>
    </>
  );
}

LineChart.propTypes = {
  data: PropTypes.array.isRequired,
  height: PropTypes.number.isRequired,
  xTicks: PropTypes.number,
  yTicks: PropTypes.number,
};
