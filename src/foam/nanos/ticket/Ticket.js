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
    'foam.core.Validatable',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  requires: [
    'foam.nanos.ticket.TicketStatus',
  ],

  javaImports: [
    'java.util.Date',
  ],

  imports: [
    'userDAO',
    'ticketDAO',
    'ticketStatusDAO'
  ],

  tableColumns: [
    'id',
    'type',
    // REVIEW: view fails to display when owner in tableColumn, the 2nd entry in allColumns is undefined.
    // 'owner',
    'lastModified',
    'status',
    'title'
  ],

  sections: [
    {
      name: 'infoSection',
      title: 'Ticket',
    },
    {
      name: 'metaSection',
      isAvailable: function(id) {
        return id != 0;
      },
      title: '',
    },
    {
      name: '_defaultSection',
      permissionRequired: true,
      hidden: true
    },
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: 'RO',
      section: 'infoSection',
      order: 1,
      tableWidth: 100
    },
    {
      name: 'type',
      class: 'String',
      visibility: 'RO',
      storageTransient: true,
      section: 'infoSection',
      getter: function() {
         return this.cls_.name;
      },
      javaGetter: `
    return getClass().getSimpleName();
      `,
      tableWidth: 160,
      order: 2
    },
    {
      class: 'Reference',
      of: 'foam.nanos.ticket.TicketStatus',
      name: 'status',
      value: 'OPEN',
      javaFactory: 'return "OPEN";',
      includeInDigest: true,
      section: 'infoSection',
      order: 3,
      tableWidth: 130,
      tableCellFormatter: function(value, obj) {
        obj.ticketStatusDAO.find(value).then(function(status) {
          if (status) {
            this.add(status.label);
          }
        }.bind(this));
      },
      view: function(_, x) {
        return {
          class: 'foam.u2.view.ModeAltView',
          readView: {
            class: 'foam.u2.view.ReferenceView',
            of: 'foam.nanos.ticket.TicketStatus'
          },
          writeView: {
            class: 'foam.u2.view.ChoiceView',
            choices: x.data.statusChoices
          }
        };
      },
    },
    {
      name: 'statusChoices',
      hidden: true,
      factory: function() {
        var s = [];
        if ( 'CLOSED' == this.status ) {
          s.push(['CLOSED', 'CLOSED']);
        } else {
          s.push(this.status),
          s.push(['CLOSED', 'CLOSED']);
        }
        return s;
      },
      documentation: 'Returns available statuses for each ticket depending on current status'
    },
    // REVIEW: can't get this to work.
    // {
    //   name: 'watchers',
    //   class: 'List',
    //   javaType: 'java.util.ArrayList<java.lang.Long>',
    //   view: {
    //     class: 'foam.u2.view.ReferenceArrayView',
    //     daoKey: 'userDAO'
    //   },
    //   section: 'metaSection',
    // },
    {
      class: 'String',
      name: 'title',
      // REVIEW: required causing issues for extended classes - 'Save' is never enabled.
      // required: true,
      tableWidth: 250,
      section: 'infoSection',
      validationPredicate: [
        {
          args: ['title', 'type'],
          predicateFactory: function(e) {
            return e.GT(
              foam.mlang.StringLength.create({
                arg1: foam.nanos.ticket.Ticket.TITLE
              }), 0);
          },
          errorString: 'Please provide a summary of the Ticket.'
        }
      ],
      order: 4
    },
    {
      class: 'String',
      name: 'comment',
      value: '',
    // required: true,
      storageTransient: true,
      section: 'infoSection',
      validationPredicate: [
        {
          args: ['id', 'title', 'comment'],
          predicateFactory: function(e) {
            return e.OR(
              e.AND(
                e.EQ(foam.nanos.ticket.Ticket.ID, 0),
                e.GT(
                  foam.mlang.StringLength.create({
                    arg1: foam.nanos.ticket.Ticket.TITLE
                  }), 0)
              ),
              e.GT(
              foam.mlang.StringLength.create({
                arg1: foam.nanos.ticket.Ticket.COMMENT
              }), 0)
            );
          },
          errorString: 'Please provide a comment.'
        }
      ],
      order: 5
    },
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO',
      includeInDigest: true,
      section: 'metaSection',
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
      section: 'metaSection',
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
      section: 'metaSection',
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      visibility: 'RO',
      section: 'metaSection',
      tableWidth: 150
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
      section: 'metaSection',
    },
    {
      name: 'summary',
      class: 'String',
      transient: true,
      hidden: true,
      tableCellFormatter: function(value, obj) {
        this.add(obj.title);
      }
    }
  ],

  actions: [
    {
      name: 'close',
      tableWidth: 70,
      confirmationRequired: true,
      isAvailable: function(status) {
        return status != 'CLOSED';
      },
      code: function() {
        this.status = 'CLOSED';
        this.ticketDAO.put(this).then(function(ticket) {
          this.copyFrom(ticket);
        }.bind(this));
      }
    },
  ]
});
