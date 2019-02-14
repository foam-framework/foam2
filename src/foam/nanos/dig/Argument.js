/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'Argument',

  documentation: 'to specify parameters info on picked method on SUGAR',

  properties: [
   {
    class: 'String',
    name: 'name',
    documentation: 'Parameters defined name',
    visibility: foam.u2.Visibility.RO
   },
   {
     class: 'String',
     name: 'javaType',
     label: 'java Type',
     displayWidth: '100',
     documentation: 'Parameters defined javaType',
     visibility: foam.u2.Visibility.RO
    },
    {
     class: 'String',
     name: 'of',
     label: 'of',
     displayWidth: '100',
     visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      documentation: 'Parameters input value',
      name: 'value',
      displayWidth: 120
    },
    {
      class: 'FObjectProperty',
      name: 'objectType',
      label: 'Object Value',
      documentation: 'Parameters input value (Object Type Parameters)',
      factory: function() {
        var model = foam.lookup(this.javaType, true);

        if ( this.javaType != '' && ( this.javaType != 'String' && this.javaType != 'double' && this.javaType != 'boolean' && this.javaType != 'long' && this.javaType != 'foam.core.X' ) )
          return model.create(null, this);
      }
    }
  ],

  methods: [
  ]
});
