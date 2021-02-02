/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'FileType',
  documentation: 'type of file such as PDF, JPGE, CSV',

  // TODO: change id to multipart key [ 'type', 'subtype' ]
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
      updateVisibility: 'RO',
    },
    {
      class: 'String',
      name: 'subType',
      updateVisibility: 'RO',
    },
    {
      class: 'String',
      name: 'abbreviation',
      updateVisibility: 'RO',
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() { return this.type + '/' + this.subType; },
      javaCode: `return getType()+"/"+getSubType();`
    }
  ]
});
