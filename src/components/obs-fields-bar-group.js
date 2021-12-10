import * as React from 'react';
import PropTypes from 'prop-types';
import {
  Axis,
  BarGroup,
  BarSeries,
  Grid,
  Tooltip,
  XYChart,
} from '@visx/xychart';
import { scaleOrdinal } from '@visx/scale';
import { LegendOrdinal } from '@visx/legend';

const fieldKeys = [
  'Partly Cloudy', 'Cloudy', 'Sunny, Clear',
  'Calm', 'Slight Breeze', 'Windy',
  'Fog, Mist', 'Heavy Rain', 'Light Rain', 'None',
  'Ground', 'Street', 'Window Sill',
];
const accessors = {
  x: {},
  y: {},
};
fieldKeys.forEach(k => {
  accessors.x[k] = d => d.field;
  accessors.y[k] = d => d[k];
})

export default function ObsFieldsBarGroup({
  data, height, showGridColumns, showGridRows, animationTrajectory,
  numTicks, showHorizontalCrosshair, showVerticalCrosshair, sharedTooltip,
}) {

  console.log(data);

  // const totalDead = data.reduce((a, r) => a + r.dead, 0);
  // const totalAlive = data.reduce((a, r) => a + r.alive, 0);
  // const totalScale = scaleOrdinal({
    // domain: [`Dead: ${totalDead}`, `Alive: ${totalAlive}`],
    // range: ['#0b7285', '#66d9e8'],
  // });

  return (
    <>

      <XYChart
        xScale={{ type: 'band', paddingInner: 0.3 }}
        yScale={{ type: 'linear' }}
        height={Math.min(400, height)}
      >
        <Grid
          key={`grid-${animationTrajectory}`} // force animate on update
          rows={showGridRows}
          columns={showGridColumns}
          animationTrajectory={animationTrajectory}
          numTicks={numTicks}
        />
        <BarGroup>
          {fieldKeys.map(k => {
            console.log(k);
            if (accessors.x[k]) { 
              return (
                <BarSeries
                  dataKey={k}
                  data={data}
                  xAccessor={accessors.x[k]}
                  yAccessor={accessors.y[k]}
                />
              )
            }
          })}
        </BarGroup>

        <Axis
          orientation="bottom"
          label="Dates"
        />
        <Axis
          orientation="left"
          label="Window Strikes"
        />

      </XYChart>
    </>
  );
}

ObsFieldsBarGroup.propTypes = {
  data: PropTypes.array.isRequired,
  height: PropTypes.number,
  showGridColumns: PropTypes.bool,
  showGridRows: PropTypes.bool,
  animationTrajectory: PropTypes.string,
  numTicks: PropTypes.number,
  showVerticalCrosshair: PropTypes.bool,
  showHorizontalCrosshair: PropTypes.bool,
  sharedTooltip: PropTypes.bool,
};

ObsFieldsBarGroup.defaultProps = {
  showGridColumns: false,
  showGridRows: true,
  animationTrajectory: 'center',
  numTicks: 4,
  showVerticalCrosshair: true,
  showHorizontalCrosshair: false,
  sharedTooltip: true,
};
