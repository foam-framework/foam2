/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift',
  name: 'ProtocolField',

  properties: [
    'name',
    'type',
    'get',
    'set',
  ],

  methods: [
    function outputSwift(o) {
      o.indent();
      o.out(
        'var ',
        this.name,
        ': ',
        this.type,
        ' {',
        this.get ? ' get' : '',
        this.set ? ' set' : '',
        ' }'
      );
    }
  ]
});

