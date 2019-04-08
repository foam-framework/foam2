/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift', // TODO: Copied from java. Move somewhere central.
  name: 'Outputter',
  flags: ['swift'],

  properties: [
    {
      name: 'indentLevel_',
      value: 0
    },
    {
      name: 'indentStr',
      value: '  '
    },
    {
      class: 'String',
      name: 'buf_'
    },
    {
      class: 'String',
      name: 'outputMethod'
    }
  ],

  methods: [
    function indent() {
      for ( var i = 0 ; i < this.indentLevel_ ; i++ ) this.buf_ += this.indentStr;
      return this;
    },

    function out() {
      for ( var i = 0 ; i < arguments.length ; i++ ) {
        if ( arguments[i] != null && arguments[i][this.outputMethod] ) {
          arguments[i][this.outputMethod](this);
        }
        else this.buf_ += arguments[i];
      }
      return this;
    },

    function increaseIndent() {
      this.indentLevel_++;
    },

    function decreaseIndent() {
      this.indentLevel_--;
    }
  ]
});
