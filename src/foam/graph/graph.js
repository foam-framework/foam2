/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
