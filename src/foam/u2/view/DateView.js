/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'DateView',
  extends: 'foam.u2.view.ModeAltView',

  documentation: 'A view for foam.core.Date properties.',

  requires: [
    'foam.u2.DateView',
    'foam.u2.view.date.DateTimePicker',
    'foam.u2.view.ValueView'
  ],

  constants: [
    {
      // Choose the writeView delegate based on browser compatibility.
      // Safari doesn't support date input types.
      name: 'READ_DELEGATE',
      factory: function() {
        var e = document.createElement('input');
        e.setAttribute('type', 'date');
        return e.type === 'text' ?
          'foam.u2.view.date.RODateView' :
          'foam.u2.DateView' ;
      }
    },
    {
      // Choose the writeView delegate based on browser compatibility.
      // Safari doesn't support date input types.
      name: 'WRITE_DELEGATE',
      factory: function() {
        var e = document.createElement('input');
        e.setAttribute('type', 'date');
        return e.type === 'text' ?
          'foam.u2.view.date.DateTimePicker' :
          'foam.u2.DateView' ;
      }
    }
  ],

  properties: [
    {
      name: 'readView',
      factory: function() { return { class: this.READ_DELEGATE }; }
    },
    {
      name: 'writeView',
      factory: function() { return { class: this.WRITE_DELEGATE }; }
    }
  ]
});
