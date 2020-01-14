/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ticket',
  name: 'TicketComment',

  documentation: 'Ticket Comment',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  imports: [
    'userDAO'
  ],

  javaImports: [
    'java.util.Date'
  ],

  tableColumns: [
    'created',
    'createdBy',
    'createdByAgent',
    'comment'
  ],

  sections: [
    {
      name: 'infoSection',
      title: ''
    },
    {
      name: 'metaSection',
      title: ''
    }
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      hidden: true,
    },
    {
      class: 'String',
      name: 'comment',
      label: '',
      view: {
        class: 'foam.u2.tag.TextArea', rows: 5, cols: 144
      },
      section: 'infoSection'
    },
    {
      class: 'Boolean',
      name: 'external',
      documentation: 'only visible to ticket non-owner (group/organization) when true',
      value: false,
      section: 'infoSection'
    },
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO',
      includeInDigest: true,
      section: 'metaSection'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      visibility: 'RO',
      includeInDigest: true,
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            this.add(user.legalName);
          }
        }.bind(this));
      },
      section: 'metaSection'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      visibility: 'RO',
      includeInDigest: true,
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            this.add(user.legalName);
          }
        }.bind(this));
      },
      section: 'metaSection'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      visibility: 'RO',
      section: 'metaSection'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      visibility: 'RO',
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            this.add(user.legalName);
          }
        }.bind(this));
      },
      section: 'metaSection'
    }
  ]
});
