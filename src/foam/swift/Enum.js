/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift',
  name: 'Enum',
  flags: ['swift'],

  requires: [
    'foam.swift.Outputter',
    'foam.swift.EnumValue',
  ],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'visibility',
      value: 'public'
    },
    {
      class: 'FObjectArray',
      of: 'foam.swift.Method',
      name: 'methods',
      factory: function() { return []; }
    },
    {
      class: 'FObjectArray',
      of: 'foam.swift.Field',
      name: 'fields',
    },
    {
      class: 'FObjectArray',
      of: 'foam.swift.EnumValue',
      name: 'values',
    },
    {
      class: 'String',
      name: 'extends',
    },
    {
      class: 'StringArray',
      name: 'implements'
    },
  ],

  methods: [
    function method(m) {
      this.methods.push(m);
      return this;
    },

    function toSwiftSource() {
      var output = this.Outputter.create({outputMethod: 'outputSwift'});
      output.out(this);
      return output.buf_;
    },

    function outputSwift(o) {
      o.indent();
      o.out('// GENERATED CODE. DO NOT MODIFY BY HAND.\n');
      o.out(
        this.visibility,
        this.visibility ? ' ' : '',
        'enum ',
        this.name,
        this.extends || this.implements.length ? ': ' : '',
        [this.extends].concat(this.implements).join(', ')
      );

      o.out(' {\n');

      o.increaseIndent();
      for ( var i = 0 ; i < this.values.length ; i++ ) {
        o.indent();
        o.out(this.values[i]);
        o.out('\n');
      }
      for ( var i = 0 ; i < this.methods.length ; i++ ) {
        o.indent();
        o.out(this.methods[i]);
        o.out('\n');
      }
      for ( var i = 0 ; i < this.fields.length ; i++ ) {
        o.indent();
        o.out(this.fields[i]);
        o.out('\n');
      }

      o.decreaseIndent();
      o.out('}');
    }
  ]
});
