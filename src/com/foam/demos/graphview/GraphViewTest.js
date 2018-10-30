/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS( {
  package: 'com.foam.demos.graphview',
  name: 'GraphViewTest',
  extends: 'foam.u2.Element',

  requires: [
    'com.foam.demos.graphview.GraphView',
    'foam.graphics.Box',
    'foam.graphics.Circle',
  ],

  exports: [ 'as data' ],

  constants: {
    SELECTED_COLOR: '#ddd',
    UNSELECTED_COLOR: 'white'
  },

  properties: [
    /*{
      name: 'canvas',
      factory: function() {
        return this.Box.create({width: 600, height: 500, color: '#f3f3f3'});
      }
    },*/
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.
      add( this.GraphView.create( {} ) );
    }
  ]
} );
