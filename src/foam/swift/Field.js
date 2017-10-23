/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift',
  name: 'Field',

  properties: [
    'visibility',
    'name',
    'type',
    'static',
    'final',
    'lazy',
    'weak',
    'override',
    'defaultValue',
    {
      name: 'initializer',
      class: 'String',
    },
    {
      name: 'getter',
      class: 'String',
    },
    {
      name: 'setter',
      class: 'String',
    },
  ],

  methods: [
    function outputSwift(o) {
      o.indent();
      o.out(
        this.override ? 'override ' : '',
        this.visibility ? this.visibility + ' ' : '',
        this.static ? 'static ' : '',
        this.lazy ? 'lazy ' : '',
        this.weak ? 'weak ' : '',
        this.final ? 'let ' : 'var ',
        this.name);
      if (this.type) o.out(': ', this.type);
      if (this.initializer) {
        o.out(' = {\n');
        o.increaseIndent();
        o.indent();
        o.out(this.initializer, '\n');
        o.decreaseIndent();
        o.indent();
        o.out('}()');
      } else if (this.getter || this.setter) {
        o.out(' {\n');
        o.increaseIndent();
        o.indent();
        if (this.getter) {
          o.out('get {\n');
          o.increaseIndent();
          o.indent();
          o.out(this.getter, '\n');
          o.decreaseIndent();
          o.indent();
          o.out('}\n');
        }
        if (this.setter) {
          o.out('set(value) {\n');
          o.increaseIndent();
          o.indent();
          o.out(this.setter, '\n');
          o.decreaseIndent();
          o.indent();
          o.out('}\n');
        }
        o.decreaseIndent();
        o.indent();
        o.out('}');
      } else if (this.defaultValue) {
        o.out(' = ', this.defaultValue);
      }
    }
  ]
});
