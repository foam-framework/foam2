/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.java',
  name: 'ArgumentArray',
  extends: 'FObjectArray',

  documentation: 'A subclass of FObjectArray with short-form syntax for defining Arguments',

  properties: [
    [ 'of', 'foam.java.Argument' ],
    [ 'adaptArrayElement', function(e, obj) {
      // Support type short-form: 'Type argName'
      if ( foam.String.isInstance(e) ) {
        var a = e.trim().split(' ');
        if ( a.length != 2 ) console.log('********************************** ArgumentArray.adaptArrayElement: ', a.length, e)
        // console.log('ArgumentArray.adaptArrayElement **************************************************************************',a);
        e = { type: a[0], name: a[1] };
      }

      return foam.core.FObjectArray.ADAPT_ARRAY_ELEMENT.value.call(this, e, obj);
    }],
    [ 'adapt', function(_, a, prop) {
      // Support comma-delimited String of types, like:
      // FObject obj, Int age, String name
      if ( foam.String.isInstance(a) ) {
        a = a.split(',');
        // console.log('ArgumentArray.adapt **************************************************************************',a);
      }

      return foam.core.FObjectArray.ADAPT.value.call(this, _, a, prop);
    }]
  ],

  methods: [
    function outputJava(o) {
      o.out(this.type, ' ', this.name);
    }
  ]
});
