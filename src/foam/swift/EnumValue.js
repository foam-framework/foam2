foam.CLASS({
  package: 'foam.swift',
  name: 'EnumValue',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
  ],

  methods: [
    function outputSwift(o) {
      o.out('case ', this.name)
    }
  ]
});

