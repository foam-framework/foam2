foam.CLASS({
  package: 'foam.swift',
  name: 'ProtocolMethod',
  requires: [
    'foam.swift.ProtocolArgument',
  ],
  properties: [
    'name',
    'returnType',
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
        this.returnType ? ' -> ' + this.returnType : '');
    }
  ]
});
