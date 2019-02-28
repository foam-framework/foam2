/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift',
  name: 'EnumValue',
  flags: ['swift'],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
  ],

  methods: [
    function outputSwift(o) {
      o.out('case ', this.name)
    }
  ]
});

