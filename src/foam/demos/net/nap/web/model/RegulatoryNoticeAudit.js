/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.net.nap.web.model',
  name: 'RegulatoryNoticeAudit',

  imports: [
    'regulatoryNoticeAuditDAO',
    'user'
  ],

  javaImports: [ 'java.util.Date' ],
  
  ids: [ 'regulatoryNoticeId' ],

  properties: [
    {
      class: 'Long',
      name: 'regulatoryNoticeId',
      documentation: 'Message Id the user read'
    },
    {
      class: 'Long',
      name: 'userId'
    },
    {
      class: 'DateTime',
      name: 'readDate',
      visibility: foam.u2.Visibility.RO,
      factory: function() { return new Date(); },
      javaFactory: 'return new Date();',
      tableCellFormatter: function(date) {
        this.add(date ? date.toISOString().substring(0,10) : '');
      }
    }
  ]
});
