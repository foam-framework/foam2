foam.CLASS( {
  package: 'foam.graphics',
  name: 'LegendEntries',
  extends: 'foam.core.Property',

  documentation: 'LegendEntries  [ name ,  value [ float ] ]',

  properties: [ {
      class: 'String',
      name: 'seriesName'
    },
    {
      class: 'Array',
      of: 'Float',
      name: 'seriesValues'
    },
    {
      name: 'total',
      factory: function () {
        return this.seriesValues.reduce( ( prev, curr ) => prev + curr );
      }
    }
  ],
} );
