import * as React from 'react';
import PropTypes from 'prop-types';
import { format, startOfWeek } from 'date-fns';
import {
  Axis,
  BarStack,
  BarSeries,
  Grid,
  Tooltip,
  XYChart,
} from '@visx/xychart';
import { scaleOrdinal } from '@visx/scale';
import { LegendOrdinal } from '@visx/legend';

const accessors = {
  x: {
    dead: d => d.date,
    alive: d => d.date,
  },
  y: {
    dead: d => d.dead,
    alive: d => d.alive,
  },
  date: d => d.date,
};

export default function DeadAliveBarChart({
  data, height, showGridColumns, showGridRows, animationTrajectory,
  numTicks, showHorizontalCrosshair, showVerticalCrosshair, sharedTooltip,
}) {
  /* eslint-disable no-param-reassign */
  const weeklyObj = data.reduce((a, r) => {
    const weekStart = format(startOfWeek(r.date, { weekStartsOn: 1 }), 'MMM d');
    if (!a[weekStart]) {
      a[weekStart] = {
        date: weekStart,
        count: r.count,
        dead: r.dead,
        alive: r.alive,
      };
    } else {
      a[weekStart].count += r.count;
      a[weekStart].dead += r.dead;
      a[weekStart].alive += r.alive;
    }
    return a;
  }, {});
  /* eslint-enable no-param-reassign */
  const weeklyData = Object.keys(weeklyObj).map(k => weeklyObj[k]);

  const totalDead = data.reduce((a, r) => a + r.dead, 0);
  const totalAlive = data.reduce((a, r) => a + r.alive, 0);
  const totalScale = scaleOrdinal({
    domain: [`Dead: ${totalDead}`, `Alive: ${totalAlive}`],
    range: ['#0b7285', '#66d9e8'],
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
        <BarStack>
          <BarSeries
            dataKey="Dead"
            data={weeklyData}
            xAccessor={accessors.x.dead}
            yAccessor={accessors.y.dead}
          />
          <BarSeries
            dataKey="Alive"
            data={weeklyData}
            xAccessor={accessors.x.alive}
            yAccessor={accessors.y.alive}
          />
        </BarStack>

        <Axis
          orientation="bottom"
          label="Dates"
        />
        <Axis
          orientation="left"
          label="Window Strikes"
        />

        <Tooltip
          showHorizontalCrosshair={showHorizontalCrosshair}
          showVerticalCrosshair={showVerticalCrosshair}
          snapTooltipToDatumX
          snapTooltipToDatumY
          showSeriesGlyphs={sharedTooltip}
          renderTooltip={({ tooltipData, colorScale }) => (
            <>
              {/** date */}
              {(tooltipData?.nearestDatum?.datum
                && `Week of ${accessors.date(tooltipData?.nearestDatum?.datum)}`)
                || 'No date'}
              <br />
              <br />
              {/** counts */}
              {(
                (sharedTooltip
                  ? Object.keys(tooltipData?.datumByKey ?? {})
                  : [tooltipData?.nearestDatum?.key]
                ).filter(status => status)
              ).map((status) => {
                const count = tooltipData?.nearestDatum?.datum
                  && accessors.y[status.toLowerCase()](
                    tooltipData?.nearestDatum?.datum,
                  );

                return (
                  <div key={status}>
                    <em
                      style={{
                        color: colorScale?.(status),
                        textDecoration:
                          tooltipData?.nearestDatum?.key === status ? 'underline' : undefined,
                      }}
                    >
                      {status}
                    </em>{' '}
                    {count == null || Number.isNaN(count)
                      ? '–'
                      : `${count}`}
                  </div>
                );
              })}
            </>
          )}
        />
      </XYChart>
    </>
  );
}

DeadAliveBarChart.propTypes = {
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

DeadAliveBarChart.defaultProps = {
  showGridColumns: false,
  showGridRows: true,
  animationTrajectory: 'center',
  numTicks: 4,
  showVerticalCrosshair: true,
  showHorizontalCrosshair: false,
  sharedTooltip: true,
};
