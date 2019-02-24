/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift',
  name: 'Field',
  flags: ['swift'],

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
      name: 'didSet',
      class: 'String',
    },
    {
      name: 'willSet',
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
    {
      class: 'StringArray',
      name: 'annotations',
    },
  ],

  methods: [
    function outputSwift(o) {
      o.indent();
      o.out(this.annotations.join('\n'), this.annotations.length ? '\n' : '');
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
      } else if (this.getter || this.setter || this.didSet || this.willSet) {
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
        if (this.didSet) {
          o.out('didSet {\n');
          o.increaseIndent();
          o.indent();
          o.out(this.didSet, '\n');
          o.decreaseIndent();
          o.indent();
          o.out('}\n');
        }
        if (this.willSet) {
          o.out('willSet {\n');
          o.increaseIndent();
          o.indent();
          o.out(this.willSet, '\n');
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
