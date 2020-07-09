foam.CLASS({
  package: 'foam.graph',
  name: 'GraphNode',

  properties: [
    {
      name: 'forwardLinks',
      class: 'StringArray'
    },
    {
      name: 'inverseLinks',
      class: 'StringArray'
    },
    {
      name: 'data',
      of: 'foam.core.FObject',
    }
  ]
});

foam.CLASS({
  package: 'foam.graph',
  name: 'GraphBuilder',

  requires: [
    'foam.graph.GraphNode'
  ],

  properties: [
    {
      name: 'data',
      class: 'Map'
    }
  ],

  methods: [
    function fromRelationship(rootObject, relationshipKey) {
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
    }
  ],
});