import * as React from 'react';
import PropTypes from 'prop-types';
import { animated, useTransition, interpolate } from 'react-spring';
import Pie from '@visx/shape/lib/shapes/Pie';
import { Group } from '@visx/group';
import { scaleOrdinal } from '@visx/scale';


export default function PieChart({
  data, width, height, animate = true,
}) {
  const [selectedSpecies, setSelectedSpecies] = React.useState(null);

  const margin = {
    top: 20, right: 20, bottom: 20, left: 20,
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

  return (
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
           />
         )}
        </Pie>

      </Group>
    </svg>
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
}) {
  const transitions = useTransition(arcs, {
    from: animate ? fromLeaveTransition : enterUpdateTransition,
    enter: enterUpdateTransition,
    update: enterUpdateTransition,
    leave: animate ? fromLeaveTransition : enterUpdateTransition,
    keys: getKey,
  });
  return transitions((props, arc, { key }) => {
    const [centroidX, centroidY] = path.centroid(arc);
    const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;
    console.log(`${centroidX}, ${centroidY}`);

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
        />
        {hasSpaceForLabel && (
          <animated.g style={{ opacity: props.opacity }}>
            <text
              fill="#495057"
              x={centroidX}
              y={centroidY}
              dy=".33em"
              fontSize={11}
              textAnchor="middle"
              pointerEvents="none"
            >
              {getKey(arc)}
            </text>
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
};
