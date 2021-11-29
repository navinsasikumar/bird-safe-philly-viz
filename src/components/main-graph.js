import * as React from 'react';
import PropTypes from 'prop-types';
import LineChart from './line-chart';
import PieChart from './pie-chart';

export default function MainGraph({ lineData, pieData }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <p className="pt-4 pl-8">Daily Window Strikes</p>
        <LineChart data={lineData} height={300}/>
      </div>

      <div>
        <p className="pt-4 pl-8">Species Composition</p>
        <PieChart data={pieData} height={300} width={400}/>
      </div>
    </div>
  );
}

MainGraph.propTypes = {
  lineData: PropTypes.array.isRequired,
  pieData: PropTypes.array.isRequired,
};
