/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
        this.annotations.length ? this.annotations.join(' ') + ' ' : '',
        this.type);
    }
  ]
});

