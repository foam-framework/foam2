/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift',
  name: 'Method',
  flags: ['swift'],

  properties: [
    'name',
    'visibility',
    'returnType',
    'static',
    'class',
    'body',
    'throws',
    'override',
    {
      class: 'FObjectArray',
      of: 'foam.swift.Argument',
      name: 'args'
    },
    {
      class: 'StringArray',
      name: 'annotations'
    },
  ],

  methods: [
    function outputSwift(o) {
      o.indent();

      o.out(
        this.annotations.length ? this.annotations.join('\n') + '\n' : '',
        this.visibility ? this.visibility + ' ' : '',
        this.override ? 'override ' : '',
        this.static ? 'static ' : '',
        this.class ? 'class ' : '',
        this.name != 'init' ? 'func ' : '',
        '`', this.name, '`',
        '(');

      for (var i = 0, arg; arg = this.args[i]; i++) {
        o.out(i > 0 ? ', ' : '');
        arg.outputSwift(o);
      }

      o.out(
        ')',
        this.throws ? ' throws' : '',
        this.returnType && this.returnType != 'Void' ? ' -> ' + this.returnType : '',
        ' {\n');

      o.increaseIndent();
      o.indent();
      o.out(this.body, '\n');
      o.decreaseIndent();
      o.indent();
      o.out('}');
    }
  ]
});
