//
//
// MNRowView + Grid DAO test
//
//

var nextSourceId = 0;
foam.CLASS({
  package: 'test',
  name: 'Source',

  properties: [
    { name: 'id', factory: function() { return nextSourceId++; } }
  ]
});

var nextTargetId = 0;
foam.CLASS({
  package: 'test',
  name: 'Target',

  properties: [
    { name: 'id', factory: function() { return nextTargetId++; } }
  ]
});

foam.RELATIONSHIP({
  sourceModel: 'test.Source',
  targetModel: 'test.Target',
  forwardName: 'targets',
  inverseName: 'sources',
  cardinality: '*:*'
});

foam.CLASS({
  package: 'test',
  name: 'Ready',

  properties: [
    {
      class: 'Function',
      name: 'run',
      required: true
    }
  ],

  methods: [ function go() { this.run(); } ]
});
