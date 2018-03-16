/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box',
  name: 'BoxJsonOutputter',
  extends: 'foam.json.Outputter',

  requires: [ 'foam.box.ReturnBox' ],
  imports: [ 'me' ],

  methods: [
    function output(o) {
      if ( o === this.me ) {
        return this.SUPER(this.ReturnBox.create());
      }
      return this.SUPER(o);
    }
  ]
});
