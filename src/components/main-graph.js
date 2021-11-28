import * as React from 'react';
import PropTypes from 'prop-types';
import LineChart from './line-chart';

export default function MainGraph({ data }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <p className="pt-4 pl-8">Daily Window Strikes</p>
        <LineChart data={data} height={300}/>
      </div>

      <div>
      </div>
    </div>
  );
}

MainGraph.propTypes = {
  data: PropTypes.array.isRequired,
};
