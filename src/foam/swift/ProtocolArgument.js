foam.CLASS({
  package: 'foam.swift',
  name: 'ProtocolArgument',
  extends: 'foam.swift.Argument',
  methods: [
    function outputSwift(o) {
      o.out(
        this.externalName,
        this.externalName != this.localName ? ' ' + this.localName : '',
        ': ',
        this.mutable ? 'inout ' : '',
        this.type);
    }
  ]
});

