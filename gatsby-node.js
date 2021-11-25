/* Code from https://stackoverflow.com/a/49317803 by Nenu (CC BY-SA 4.0) */

const axios = require('axios');
const crypto = require('crypto');

exports.sourceNodes = async ({ actions }) => {
  const { createNode } = actions;

  // fetch raw data from the randomuser api
  const fetchObservations = (page) => {
    if (!page) page = 1;
    return axios.get(`https://api.inaturalist.org/v1/observations?project_id=bird-safe-philly-bird-strikes-project&per_page=200&page=${page}`);
  }
  // await for results
  let res = await fetchObservations();
  let observations = res.data.results;

  while (res.data.total_results > res.data.page * res.data.per_page) {
    const page = res.data.page + 1;
    res = await fetchObservations(page);
    observations = [...observations, ...res.data.results];
  }

  // map into these results and create nodes
  observations.map((observation, i) => {
    // Create your node object
    const observationNode = {
      // Required fields
      id: `${i}`,
      parent: `__SOURCE__`,
      internal: {
        type: `Observation`, // name of the graphQL query --> allObservation {}
        // contentDigest will be added just after
        // but it is required
      },
      children: [],

      // Other fields that you want to query with graphQl
      observation_id: observation.id,
      observed_on: observation.observed_on,
      observed_on_details: observation.observed_on_details,
      place_ids: observation.place_ids,
      taxon: {
        ancestor_ids: observation.taxon.ancestor_ids,
        name: observation.taxon.name,
        preferred_common_name: observation.taxon.preferred_common_name,
      },
      geojson: observation.geojson,
      user: observation.user.login
      // etc...
    }

    // Get content digest of node. (Required field)
    const contentDigest = crypto
      .createHash(`md5`)
      .update(JSON.stringify(observationNode))
      .digest(`hex`);
    // add it to userNode
    observationNode.internal.contentDigest = contentDigest;

    // Create node with the gatsby createNode() API
    createNode(observationNode);
  });

  return;
}
