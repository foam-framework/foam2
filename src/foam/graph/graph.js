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
  name: 'Graph',

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
    function getDirectChildren(parentId, order) {
      var parentNode = this.data[parentId];
      var childNodes = parentNode.forwardLinks.map(id => this.data[id]);
      
      if ( order ) {
        let i = 0;
        let idsBehind = {};
        let swappedFrom = {};
        while ( i < childNodes.length ) {
          console.log(i);
          let node = childNodes[i];

          // Determine if/what this node should be swapped with
          let needToSwap = false;
          for ( let j = 0 ; j < node.forwardLinks.length ; j ++ ) {
            let link = node.forwardLinks[j];
            if ( link == parentNode.data.id ) continue;
            if ( ! idsBehind[link] ) {
              needToSwap = link;
              break;
            }
          }

          // Find prerequisite to swap with
          if ( needToSwap ) {
            if ( swappedFrom[node.data.id] ) {
              swappedFrom = {};
              idsBehind[node.data.id] = true;
              console.warn(
                'circular relation detected',
                swappedFrom, node, needToSwap, idsBehind
              );
              i++;
            }
            swappedFrom[node.data.id] = true;

            for ( let ii = i+1; ii < childNodes.length; ii++ ) {
              if ( childNodes[ii].data.id == needToSwap ) {
                let tmp = childNodes[ii];
                childNodes[ii] = childNodes[i];
                childNodes[i] = tmp;
                break;
              }
            }
            // Don't increment `i` if a swap was done
            continue;
          }
          
          swappedFrom = {};
          idsBehind[childNodes[i].data.id] = true;
          i++;
        }
      }

      return childNodes;
    }
  ]
});

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