import * as React from 'react';
import PropTypes from 'prop-types';
import DeadAliveBarChart from './dead-alive-bar-chart';
import ObsFieldsBarGroup from './obs-fields-bar-group';

export default function ObsFieldsGraph({ lineData, obsFieldsData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p className="pt-4 pl-8">Alive/Dead (Weekly)</p>
        <DeadAliveBarChart
          data={lineData}
          height={300}
        />
      </div>

      <div>
        <p className="pt-4 pl-8">Observation Fields</p>
        <div className="grid grid-cols-2 md:grid-cols-4">
          <ObsFieldsBarGroup
            data={obsFieldsData}
            field={'Skies?'}
            first={true}
            height={300}
          />
          <ObsFieldsBarGroup
            data={obsFieldsData}
            field={'Wind?'}
            height={300}
          />
          <ObsFieldsBarGroup
            data={obsFieldsData}
            field={'Precipitation?'}
            height={300}
          />
          <ObsFieldsBarGroup
            data={obsFieldsData}
            field={'Location?'}
            height={300}
          />
        </div>
      </div>
    </div>
  );
}

ObsFieldsGraph.propTypes = {
  lineData: PropTypes.array.isRequired,
  obsFieldsData: PropTypes.array.isRequired,
  height: PropTypes.number,
};
