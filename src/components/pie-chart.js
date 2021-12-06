import * as React from 'react';
import PropTypes from 'prop-types';
import { animated, useTransition, interpolate } from 'react-spring';
import Pie from '@visx/shape/lib/shapes/Pie';
import { Group } from '@visx/group';
import { scaleOrdinal } from '@visx/scale';
import { Annotation, Label, Connector } from '@visx/annotation';
import { useTooltip, useTooltipInPortal, Tooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';


export default function PieChart({
  data, width, height, animate = true,
}) {
  const [selectedSpecies, setSelectedSpecies] = React.useState(null);

  const margin = {
    top: 20, right: 20, bottom: 50, left: 20,
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;
  const donutThickness = 50;

  const pieCutoff = 10;
  const otherCount = data.reduce((r, a, i) => {
    /* eslint-disable no-param-reassign */
    if (i < pieCutoff) return r;
    r.count += a.count;
    /* eslint-enable no-param-reassign */
    return r;
  }, { species: 'Other', name: 'Other', count: 0 });

  const cutoffData = data.slice(0, pieCutoff);
  cutoffData.push(otherCount);

  // accessor functions
  const count = d => d.count;

  // color scales
  const getSpeciesColor = scaleOrdinal({
    domain: cutoffData.map(e => e.species),
    range: [
      'rgba(11,114,133,1)',
      'rgba(11,114,133,0.9)',
      'rgba(11,114,133,0.8)',
      'rgba(11,114,133,0.7)',
      'rgba(11,114,133,0.6)',
      'rgba(11,114,133,0.5)',
      'rgba(11,114,133,0.4)',
      'rgba(11,114,133,0.3)',
      'rgba(11,114,133,0.25)',
      'rgba(11,114,133,0.2)',
      'rgba(11,114,133,0.1)',
    ],
  });


  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip();

  return (
    <>
      <svg width={width} height={height}>
        <Group top={centerY + margin.top} left={centerX + margin.left}>

          <Pie
            data={cutoffData}
            pieValue={count}
            outerRadius={radius}
            innerRadius={radius - donutThickness}
            cornerRadius={3}
            padAngle={0.005}
          >
           {(pie) => (
             <AnimatedPie
               {...pie}
               animate={animate}
               getKey={(arc) => arc.data.name}
               onClickDatum={({ data: { species } }) =>
                 animate &&
                 setSelectedSpecies(selectedSpecies && selectedSpecies === species ? null : species)
               }
               getColor={(arc) => getSpeciesColor(arc.data.species)}
               width={width}
               height={height}
               onMouseOverDatum={(event, arc) => {
                 const coords = localPoint(event.target.ownerSVGElement, event);
                 const boundingRect = event.target.ownerSVGElement.getBoundingClientRect();
                 showTooltip({
                   tooltipLeft: coords.x + boundingRect.x,
                   tooltipTop: coords.y + boundingRect.y,
                   tooltipData: arc.data
                 });
               }}
               onMouseOutDatum={hideTooltip}
             />
           )}
          </Pie>

        </Group>
      </svg>

      {tooltipOpen && (
        <Tooltip
          // set this to random so it correctly updates with parent bounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
        >
          <div>
            <strong>{tooltipData.name}</strong>
          </div>
          <div>
            Count: {tooltipData.count}
          </div>
        </Tooltip>
      )}
    </>
  );
}

PieChart.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  animate: PropTypes.bool,
};

const fromLeaveTransition = ({ endAngle }) => ({
  // enter from 360° if end angle is > 180°
  startAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  endAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  opacity: 0,
});

const enterUpdateTransition = ({ startAngle, endAngle }) => ({
  startAngle,
  endAngle,
  opacity: 1,
});

function AnimatedPie({
  animate,
  arcs,
  path,
  getKey,
  getColor,
  onClickDatum,
  width,
  height,
  onMouseOverDatum,
  onMouseOutDatum,
}) {
  const transitions = useTransition(arcs, {
    from: animate ? fromLeaveTransition : enterUpdateTransition,
    enter: enterUpdateTransition,
    update: enterUpdateTransition,
    leave: animate ? fromLeaveTransition : enterUpdateTransition,
    keys: getKey,
  });
  const targetLabelOffset = (width / 2) * 0.6;

  return transitions((props, arc, { key }) => {
    const [centroidX, centroidY] = path.centroid(arc);
    const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.25;

    return (
      <g key={key}>
        <animated.path
          // compute interpolated path d attribute from intermediate angle values
          d={interpolate([props.startAngle, props.endAngle], (startAngle, endAngle) =>
            path({
              ...arc,
              startAngle,
              endAngle,
            }),
          )}
          fill={getColor(arc)}
          onClick={() => onClickDatum(arc)}
          onTouchStart={() => onClickDatum(arc)}
          onMouseOver={(event) => onMouseOverDatum(event, arc) }
          onMouseOut={() => onMouseOutDatum() }
        />
        {hasSpaceForLabel && (
          <animated.g style={{ opacity: props.opacity }}>
            <Annotation
              x={centroidX}
              y={centroidY}
              dx={
                // offset label to a constant left- or right-coordinate
                (centroidX < 0 ? -targetLabelOffset : targetLabelOffset) -
                centroidX
              }
              dy={centroidY < 0 ? -50 : 50}
            >
              <Label
                showAnchorLine={false}
                anchorLineStroke="#495057"
                showBackground={false}
                title={getKey(arc)}
                fontColor="#495057"
                titleFontSize={11}
                width={100}
                // these will work in @visx/annotation@1.4
                // see https://github.com/airbnb/visx/pull/989
                // horizontalAnchor={centroidX < 0 ? 'end' : 'start'}
                // backgroundPadding={{
                //   left: 8,
                //   right: 8,
                //   top: 0,
                //   bottom: 0
                // }}
              />
              <Connector stroke="#495057" />
            </Annotation>
          </animated.g>
        )}
      </g>
    );
  });

}

AnimatedPie.propTypes = {
  animate: PropTypes.bool.isRequired,
  getKey: PropTypes.func.isRequired,
  getColor: PropTypes.func.isRequired,
  onClickDatum: PropTypes.func.isRequired,
  delay: PropTypes.number,
  onMouseOverDatum: PropTypes.func,
  onMouseOutDatum: PropTypes.func,
};
