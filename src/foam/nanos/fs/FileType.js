/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'FileType',
  documentation: 'type of file such as PDF, JPGE, CSV',

  properties: [
    {
      class: 'String',
      name: 'id',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
    },
    {
      class: 'String',
      name: 'type',
    },
    {
      class: 'String',
      name: 'subType',
    },
    {
      class: 'String',
      name: 'abbreviation',
    }
  ],

  methods: [
    function toSummary() { return this.type + '/' + this.subType; }
  ]
});
