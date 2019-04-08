/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift',
  name: 'ProtocolMethod',
  flags: ['swift'],
  requires: [
    'foam.swift.ProtocolArgument',
  ],
  properties: [
    'name',
    'returnType',
    'throws',
    {
      class: 'FObjectArray',
      of: 'foam.swift.ProtocolArgument',
      name: 'args',
      adaptArrayElement: function(e) {
        return foam.swift.ProtocolArgument.create(e);
      },
    },
  ],
  methods: [
    function outputSwift(o) {
      o.indent();

      o.out(
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
        this.returnType && this.returnType != 'Void' ? ' -> ' + this.returnType : ''
      )
    }
  ]
});
