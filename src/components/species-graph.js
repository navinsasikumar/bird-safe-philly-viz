import * as React from 'react';
import PropTypes from 'prop-types';
import LineChart from './line-chart';

export default function SpeciesGraph({ data }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {data.map((species, index) => (
        index < 6 && (
          <div key={index}>
            <p className="pt-4 pl-8">{species.name}</p>
            <LineChart data={species.dates} height={200}/>
          </div>
        )
      ))}
    </div>
  );
}

SpeciesGraph.propTypes = {
  data: PropTypes.array.isRequired,
};
