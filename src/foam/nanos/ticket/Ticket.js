/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ticket',
  name: 'Ticket',

  documentation: 'Ticket Model',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    //'foam.nanos.auth.EnabledAware',
    //'foam.nanos.auth.DeletedAware',
  ],

  javaImports: [
    'java.util.Date'
  ],

  imports: [
    'userDAO'
  ],

  tableColumns: [
    'id',
    'type',
//    'owner',
    'lastModified',
    'status',
    'summary'
  ],

  sections: [
     {
      name: 'ticketType',
      isAvailable: function(id) { return !! id; },
      order: 1
    },
    {
      name: 'basicInfo',
      title: ''
    },
    {
      name: 'commentSection',
      title: ''
    },
    {
      name: 'comments',
      title: ''
    },
    {
      name: 'details',
      title: ''
    },
    {
      name: '_defaultSection',
      permissionRequired: true,
      hidden: true
    },
  ],

  properties: [
     {
      class: 'String',
      name: 'type',
      documentation: 'The type of the ticket.',
      transient: true,
      getter: function() {
        return this.cls_.name;
      },
      javaGetter: `
        return getClass().getSimpleName();
      `,
      tableWidth: 135,
      section: 'ticketType',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'id',
      visibility: 'RO',
      section: 'basicInfo',
    },
    {
      name: 'type',
      class: 'String',
      visibility: 'RO',
      storageTransient: true,
      section: 'basicInfo',
      getter: function() {
         return this.cls_.name;
      },
      javaGetter: `
    return getClass().getSimpleName();
      `,
      tableWidth: 160
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.ticket.TicketStatus',
      name: 'status',
      value: 'OPEN',
      includeInDigest: true,
      section: 'basicInfo',
    },
    // {
    //   name: 'watchers',
    //   class: 'List',
    //   javaType: 'java.util.ArrayList<java.lang.Long>',
    //   view: {
    //     class: 'foam.u2.view.ReferenceArrayView',
    //     daoKey: 'userDAO'
    //   },
    //   section: 'details',
    // },
    {
      class: 'String',
      name: 'summary',
      transient: true,
      tableCellFormatter: function(value, obj) {
        this.add(obj.title);
      },
      visibility: 'RO',
    },
    {
      class: 'String',
      name: 'title',
      required: true,
      section: 'basicInfo',
    },
    {
      class: 'String',
      name: 'comment',
      required: true,
      storageTransient: true,
      section: 'commentSection'
    },
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO',
      includeInDigest: true,
      section: 'details',
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
      section: 'details',
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      visibility: 'RO',
      section: 'details',
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
      section: 'details',
    },
  ]
});
