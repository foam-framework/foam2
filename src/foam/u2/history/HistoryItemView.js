/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.u2.history',
  name: 'HistoryItemView',
  implements: [
    'foam.u2.View',
  ],

  documentation: 'View displaying history item',

  methods: [
    function outputRecord(parentView, record) {}
  ]
});
