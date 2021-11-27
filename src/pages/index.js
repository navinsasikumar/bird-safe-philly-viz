/* *
 * References:
 *  https://bl.ocks.org/Qizly/8f6ba236b79d9bb03a80
 *
 */

import * as React from "react"
import { graphql } from 'gatsby'
import * as D3 from 'd3';
import "../styles/index.css"


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

// markup
const IndexPage = (props) => {
  const observations = props.data.allObs.edges;
  const groupedObs = props.data.grouped.group;

  const margin = {top: 30, right: 100, bottom: 30, left: 60};
  const width = 1490 - margin.left - margin.right;
  const height = 440 - margin.top - margin.bottom;

  const parseDate = D3.timeParse("%Y-%m-%d");
  const bisectDate = D3.bisector(d => d.weekYear).left;
  const formatValue = D3.format(",");
  const dateFormatter = D3.timeFormat("%m/%d/%y");

  /*
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
  */

  const groupedMap2 = observations.reduce((r, a) => {
    r[a.node.observed_on] = r[a.node.observed_on] || [];
    r[a.node.observed_on].push(a.node);
    return r;
  }, Object.create(null));
  const groupedMap3 = Object.keys(groupedMap2).map(e => { return { weekYear: parseDate(e), count: groupedMap2[e].length }; });
  const sortedData = groupedMap3.sort((a, b) => a.weekYear - b.weekYear);


  const dates = sortedData.map(e => e.weekYear);
  const xScale = D3.scaleTime().domain(D3.extent(dates)).range([0, width]);

  const dateGrouping = D3.timeDay;
  // const dateGrouping = D3.timeMonday // Use this is doing weeekly counts
  const denseData = xScale.ticks(dateGrouping).map(d => {
    const found = sortedData.find(e => e.weekYear.getTime() === d.getTime());
    return found || { weekYear: d, count: 0 };
  });

  const counts = denseData.map(e => e.count);
  const yScale = D3.scaleLinear().domain(D3.extent(counts)).range([height, 0]);

  const linePath = D3
    .line()
    .x(d => xScale(d.weekYear))
    .y(d => yScale(d.count))
    .curve(D3.curveMonotoneX)

  const xAxis = D3.axisBottom()
    .scale(xScale)

  const yAxis = D3.axisLeft()
    .scale(yScale)

  const mainRef = React.useRef();
  const svgRef = React.useRef();
  const tooltipRef = React.useRef();

  React.useEffect(() => {
    const tooltip = D3.select(tooltipRef.current)
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden");

    const svg = D3.select(svgRef.current)
      .append('g')
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("transform", "translate(0, 0)")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Count");

    svg
      .append('path')
      .datum(denseData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 3)
      .attr("d", linePath);

    const focus = svg.append('g')
      .attr("class", "focus")
      .style("display", "none");

    focus.append("circle")
      .attr("r", 5);

    focus.append("rect")
      .attr("class", "tooltip")
      .attr("width", 80)
      .attr("height", 50)
      .attr("x", 10)
      .attr("y", -22)
      .attr("rx", 4)
      .attr("ry", 4);

    focus.append("text")
      .attr("class", "tooltip-date")
      .attr("x", 18)
      .attr("y", -2);

    focus.append("text")
      .attr("x", 18)
      .attr("y", 18)
      .text("Count:");

    focus.append("text")
      .attr("class", "tooltip-count")
      .style('font-weight', 'bold')
      .attr("x", 60)
      .attr("y", 18);

    svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", function() { focus.style("display", null); })
      .on("mouseout", function() { focus.style("display", "none"); })
      .on("mousemove", mousemove);

    function mousemove(event) {
      const x0 = xScale.invert(D3.pointer(event)[0]);
      const i = bisectDate(denseData, x0, 1);
      const d0 = denseData[i - 1];
      const d1 = denseData[i];
      const d = x0 - d0.weekYear > d1.weekYear - x0 ? d1 : d0;

      focus.attr("transform", "translate(" + xScale(d.weekYear) + "," + yScale(d.count) + ")");
      focus.select(".tooltip-date").text(dateFormatter(d.weekYear));
      focus.select(".tooltip-count").text(formatValue(d.count));
    }

  }, [mainRef.current]);


  return (
    <main ref={mainRef}>
      <title>Bird Safe Philly Data Viz</title>
      <h1>Bird Safe Philly Data Viz</h1>

      <svg width={width + margin.left + margin.right} height={height + margin.top + margin.bottom} ref={svgRef}>
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
