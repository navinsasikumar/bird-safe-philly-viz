import * as React from "react"
import { graphql } from 'gatsby'
import * as D3 from 'd3';
import {useD3} from 'd3blackbox';


const getDateOfISOWeek = (w, y) => {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    var dow = simple.getDay();
    var ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
};

const Axis = ({x, y, scale, axisType}) => {
  const fnName = axisType === 'left' ? 'axisLeft' : 'axisBottom';
  const ref = useD3(el => D3.select(el).call(D3[fnName](scale)));
  return <g transform={`translate(${x}, ${y})`} ref={ref} />;
}

// markup
const IndexPage = (props) => {
  const observations = props.data.allObs.edges;
  const groupedObs = props.data.grouped.group;


  const width = 1400;
  const height = 400;
  const color = 'red';

  const groupedMap = groupedObs.map(years => {
    const year = years.fieldValue;
    const dateCounts = years.group.map(weeks => {
      const week = weeks.fieldValue;
      const calcDate = getDateOfISOWeek(week, year);
      const calcObj = { weekYear: calcDate, count: weeks.totalCount};
      return calcObj;
    });
    return dateCounts;
  });

  const sortedData = groupedMap.flat().sort((a, b) => a.weekYear - b.weekYear);

  const dates = sortedData.map(e => e.weekYear);
  const counts = sortedData.map(e => e.count);

  const dateRange = D3.extent(dates);

  const xScale = D3.scaleTime().domain(D3.extent(dates)).range([45, width - 10]);
  const yScale = D3.scaleLinear().domain(D3.extent(counts)).range([height - 45, 5]);

  const denseData = xScale.ticks(D3.timeMonday).map(d => {
    const found = sortedData.find(e => e.weekYear.getTime() === d.getTime());
    return found || { weekYear: d, count: 0 };
  });

  const linePath = D3
    .line()
    .x(d => xScale(d.weekYear))
    .y(d => yScale(d.count))
    .curve(D3.curveMonotoneX)
  (denseData);

  return (
    <main>
      <title>Bird Safe Philly Data Viz</title>
      <h1>Bird Safe Philly Data Viz</h1>

      <svg width={width} height={height}>
        <path strokeWidth={3} fill="none" stroke={color} d={linePath} />
        {denseData.map(d => {
          return (<circle cx={xScale(d.weekYear)} cy={yScale(d.count)} r={3}/>)
        })}
        <Axis x={40} y={0} scale={yScale} axisType="left"/>
        <Axis x={0} y={height - 40} scale={xScale} axisType="bottom"/>
      </svg>

      <div>
        {observations.map((obs, i) => {
          const obsData = obs.node;
          return (
            <div key={i}>
              <p>Species: {obsData.taxon.preferred_common_name}</p>
            </div>
          )
        })}
      </div>
    </main>
  );
}

export default IndexPage

export const query = graphql`
  query ObservationQuery {
    grouped: allObservation(filter: {observed_on_details: {year: {gte: 2021}}}) {
      totalCount
      group(field: observed_on_details___year) {
        totalCount
        group(field: observed_on_details___week) {
          totalCount
          fieldValue
        }
        fieldValue
      }
    }
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

// console.log(query);


/*
export const query = graphql`
  query ObservationQuery {
    allObservation(filter: {observed_on: {gte: "2020-01-01"}}) {
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
`; */
