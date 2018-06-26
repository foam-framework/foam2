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

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'viewer',
      view: { class: 'foam.u2.view.ReferenceView', placeholder: 'select user' }
    },
    {
      class: 'Long',
      name: 'userId'
    },
    {
      class: 'Long',
      name: 'regulatoryNoticeId'
    }
  ]
});
