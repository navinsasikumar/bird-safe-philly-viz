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

export default function ObsFieldsBarGroup({
  data, height, showGridColumns, showGridRows, animationTrajectory,
  numTicks, showHorizontalCrosshair, showVerticalCrosshair, sharedTooltip,
  field, first,
}) {
  const filteredData = data.filter(e => e.field === field);
  const fieldVals = Object.keys(filteredData[0]).filter(e => e !== 'field' && e !== 'Unknown');

  const accessors = {
    x: {},
    y: {},
  };
  fieldVals.forEach((k) => {
    accessors.x[k] = d => d.field;
    accessors.y[k] = d => d[k];
  });

  const totalScale = scaleOrdinal({
    domain: fieldVals.map(e => `${e}: ${filteredData[0][e]}`),
    range: ['#0b7285', '#66d9e8', '#fcc419', '#ff8787'],
  });

  return (
    <div>
      <XYChart
        xScale={{ type: 'band', paddingInner: 0.3 }}
        yScale={{ type: 'linear' }}
        height={Math.min(400, height)}
        width={230}
      >
        <Grid
          key={`grid-${animationTrajectory}`} // force animate on update
          rows={showGridRows}
          columns={showGridColumns}
          animationTrajectory={animationTrajectory}
          numTicks={numTicks}
        />
        <BarGroup>
          {fieldVals.map((k) => {
            if (accessors.x[k]) {
              return (
                <BarSeries
                  dataKey={k}
                  data={filteredData}
                  xAccessor={accessors.x[k]}
                  yAccessor={accessors.y[k]}
                />
              );
            }
            return (<div key={k}></div>);
          })}
        </BarGroup>

        <Axis
          orientation="bottom"
          label={field}
          numTicks={0}
        />
        <Axis
          orientation="left"
          label={ first ? 'Window Strikes' : '' }
        />

        <Tooltip
          showHorizontalCrosshair={showHorizontalCrosshair}
          showVerticalCrosshair={showVerticalCrosshair}
          snapTooltipToDatumX
          snapTooltipToDatumY
          showSeriesGlyphs={sharedTooltip}
          renderTooltip={({ tooltipData, colorScale }) => (
            <>
              {/** counts */}
              {(
                (sharedTooltip
                  ? Object.keys(tooltipData?.datumByKey ?? {})
                  : [tooltipData?.nearestDatum?.key]
                ).filter(status => status)
              ).map((status) => {
                const count = tooltipData?.nearestDatum?.datum
                  && accessors.y[status](
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
      <div style={{ fontSize: '10px', width: '230px', paddingLeft: '50px' }}>
        <LegendOrdinal scale={totalScale} direction="row" labelMargin="0 5px 0 0 " shapeHeight="15px" shapeWidth="5px" />
      </div>
    </div>
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
  field: PropTypes.string.isRequired,
  first: PropTypes.bool,
};

ObsFieldsBarGroup.defaultProps = {
  showGridColumns: false,
  showGridRows: true,
  animationTrajectory: 'center',
  numTicks: 4,
  showVerticalCrosshair: false,
  showHorizontalCrosshair: false,
  sharedTooltip: false,
};
