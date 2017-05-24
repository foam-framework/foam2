/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.boot',
  name: 'NSpec',

  ids: [ 'name' ],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'Boolean',
      name: 'serve',
      tableCellView: function(obj, e) {
        var e = e.E();
        if ( obj.serve ) { e.style({color: 'green'}); } else { e.entity('nbsp'); }
        e.add(obj.serve ? ' Y' : '-');
        return e;
      },
      documentation: 'If true, this service is served over the network.'
    },
    {
      class: 'String',
      name: 'serviceClass'
    }
    // TODO: permissions, keywords, lazy, parent
  ],

  methods: [
    {
      name: 'createService',
      javaReturns: 'foam.nanos.NanoService',
      javaCode: `return (foam.nanos.NanoService) Class.forName(getServiceClass()).newInstance();`,
      javaThrows: [
        'java.lang.ClassNotFoundException',
        'java.lang.InstantiationException',
        'java.lang.IllegalAccessException'
      ],
    }
  ]
});
