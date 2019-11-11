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
    'foam.nanos.auth.LastModifiedByAware',
//    'foam.nanos.auth.DeletedAware',
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
    'comment'
  ],

  sections: [
    {
      name: 'basicInfo',
      title: ''
    },
    {
      name: 'commentSection',
      title: ''
    },
    {
      name: 'details',
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
      class: 'DateTime',
      name: 'created',
      visibility: 'RO',
      includeInDigest: true,
      section: 'basicInfo'
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
      section: 'details'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      visibility: 'RO',
      section: 'details'
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
      section: 'details'
    },
    {
      class: 'String',
      name: 'comment',
      label: '',
      view: {
        class: 'foam.u2.tag.TextArea', rows: 5, cols: 144
      },
      section: 'commentSection'
    },
    {
      class: 'Boolean',
      name: 'external',
      documentation: 'only visible to ticket non-owner (group/organization) when true',
      value: false,
      section: 'details'
    }
  ]
});
