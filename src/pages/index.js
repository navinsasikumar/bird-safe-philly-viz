/* *
 * References:
 *  https://bl.ocks.org/Qizly/8f6ba236b79d9bb03a80
 *
 */

import * as React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';
import * as D3 from 'd3';
import '../styles/index.css';
import Layout from '../components/layout';
import MainGraph from '../components/main-graph';
import SpeciesGraph from '../components/species-graph';


const parseDate = D3.timeParse('%Y-%m-%d');

const densifyData = (data, xScale) => {
  const dateGrouping = D3.timeDay;
  const denseData = xScale.ticks(dateGrouping).map((d) => {
    const found = data.find(e => e.date.getTime() === d.getTime());
    return found || { date: d, count: 0 };
  });
  return denseData;
};

const createDateGrouped = (data) => {
  /* eslint-disable no-param-reassign */
  const groupedMap2 = data.reduce((r, a) => {
    r[a.node.observed_on] = r[a.node.observed_on] || [];
    r[a.node.observed_on].push(a.node);
    return r;
  }, Object.create(null));

  const groupedMap3 = Object.keys(groupedMap2).map(e => ({
    date: parseDate(e),
    count: groupedMap2[e].length,
    species: groupedMap2[e].reduce((r, a) => {
      r[a.taxon.preferred_common_name] = r[a.taxon.preferred_common_name] || [];
      r[a.taxon.preferred_common_name].push(a.taxon);
      return r;
    }, Object.create(null)),
  }));
  /* eslint-enable no-param-reassign */

  const sortedData = groupedMap3.sort((a, b) => a.date - b.date);
  return sortedData;
};

const createSpeciesGrouped = (data, xScale) => {
  /* eslint-disable no-param-reassign */
  const speciesKey = data.reduce((r, a) => {
    r[a.node.taxon.name] = r[a.node.taxon.name] || [];
    r[a.node.taxon.name].push(a);
    return r;
  }, Object.create(null));

  const groupedMap = Object.keys(speciesKey).map(e => ({
    species: e,
    count: speciesKey[e].length,
    dates: densifyData(createDateGrouped(speciesKey[e]), xScale),
    name: speciesKey[e][0].node.taxon.preferred_common_name || e,
  })).sort((a, b) => b.count - a.count);
  /* eslint-enable no-param-reassign */

  return groupedMap;
};


// markup
const IndexPage = (props) => {
  const observations = props.data.allObs.edges;

  const margin = {
    top: 30, right: 140, bottom: 80, left: 60,
  };
  const width = 1490 - margin.left - margin.right;

  const sortedData = createDateGrouped(observations);

  const dates = sortedData.map(e => e.date);
  const xScale = D3.scaleTime().domain(D3.extent(dates)).range([0, width]);

  const denseData = densifyData(sortedData, xScale);

  const speciesGrouped = createSpeciesGrouped(observations, xScale);

  return (
    <main>
      <title>Bird Safe Philly Data Viz</title>
      <Layout>
        <MainGraph lineData={denseData} pieData={speciesGrouped}></MainGraph>
        <SpeciesGraph data={speciesGrouped}></SpeciesGraph>
      </Layout>
    </main>
  );
};

export default IndexPage;

IndexPage.propTypes = {
  data: PropTypes.object,
};

export const query = graphql`
  query ObservationQuery2 {
    allObs: allObservation(filter: {observed_on: {gte: "2021-01-01"}}) {
      edges {
        node {
          observation_id
          observed_on
          observed_on_details {
            date
            week
            month
            hour
            year
            day
          }
          place_ids
          taxon {
            ancestor_ids
            name
            preferred_common_name
          }
          geojson {
            coordinates
            type
          }
          user
        }
      }
    }
  }
`;
