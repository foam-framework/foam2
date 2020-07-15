/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.graph',
  name: 'GraphBuilder',

  requires: [
    'foam.graph.Graph',
    'foam.graph.GraphNode'
  ],

  properties: [
    {
      name: 'data',
      class: 'Map'
    },
    {
      name: 'roots',
      class: 'Array'
    }
  ],

  methods: [
    function fromRelationship(rootObject, relationshipKey) {
      this.roots.push(rootObject);
      // Add graph node (with no relations yet)
      if ( ! this.data[rootObject.id] ) {
        this.data[rootObject.id] = this.GraphNode.create({
          data: rootObject
        });
      }

      // Iterate over rootObject's children
      var parent = this.data[rootObject.id];
      return rootObject[relationshipKey].dao
        .select().then(r => Promise.all(r.array.map(o => {
          parent.forwardLinks = [...parent.forwardLinks, o.id];
          // Add child and its children (recursively)
          return this.fromRelationship(o, relationshipKey).then(() => {
            // Add inverse links before resolving the promise
            this.data[o.id].inverseLinks =
              [...this.data[o.id].inverseLinks, rootObject.id];
          });
        })));
    },
    function build() {
      let graph = this.Graph.create({ data: this.data });
      graph.roots = this.roots;
      return graph;
    }
  ],
});