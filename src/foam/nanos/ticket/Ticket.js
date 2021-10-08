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
    'foam.nanos.auth.Authorizable',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.AssignableAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.auth.ServiceProviderAware'
  ],

  requires: [
    'foam.nanos.ticket.TicketStatus',
  ],

  javaImports: [
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'java.util.Date'
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
    'assignedTo.legalName',
    'createdBy.legalName',
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
      title: 'Audit',
    },
    {
      // NOTE: if a section is name: commentSection
      // then navigating to a comment detail view
      // does not work.
      name: '_defaultSection',
      title: 'Comments'
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
          s.push(this.status);
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
      validationPredicates: [
        {
          args: ['title', 'type'],
          predicateFactory: function(e) {
            return e.NEQ(foam.nanos.ticket.Ticket.TITLE, "");
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
      readVisibility: 'HIDDEN',
      validationPredicates: [
        {
          args: ['id', 'title', 'comment'],
          predicateFactory: function(e) {
            return e.OR(
              e.AND(
                e.EQ(foam.nanos.ticket.Ticket.ID, 0),
                e.NEQ(foam.nanos.ticket.Ticket.TITLE, "")
              ),
              e.NEQ(foam.nanos.ticket.Ticket.COMMENT, "")
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
      section: 'infoSection', // until 'owner' showing
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
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedByAgent',
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
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
      includeInDigest: true,
      section: 'systemInformation',
      writePermissionRequired: true,
      documentation: `
        Need to override getter to return "" because its trying to
        return null which breaks tests
      `,
      javaGetter: `
        if ( ! spidIsSet_ ) {
          return "";
        }
        return spid_;
      `
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'assignedTo',
      section: 'infoSection'
    }
  ],

  methods: [
    {
      name: 'authorizeOnCreate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        // Everyone can create a ticket
      `
    },
    {
      name: 'authorizeOnRead',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        Subject subject = (Subject) x.get("subject");
        User user = subject.getRealUser();

        if ( user.getId() != this.getCreatedBy() && ! auth.check(x, "ticket.read." + this.getId()) ) {
          throw new AuthorizationException("You don't have permission to read this ticket.");
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldObj', type: 'foam.core.FObject' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        Subject subject = (Subject) x.get("subject");
        User user = subject.getRealUser();

        if ( user.getId() != this.getCreatedBy() && ! auth.check(x, "ticket.update." + this.getId()) ) {
          throw new AuthorizationException("You don't have permission to update this ticket.");
        }
      `
    },
    {
      name: 'authorizeOnDelete',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        // The checkGlobalRemove has checked the permission for deleting the ticket already.
      `
    }
  ],

  actions: [
    {
      name: 'close',
      tableWidth: 70,
      confirmationRequired: function() {
        return true;
      },
      isAvailable: function(status, id) {
        return status != 'CLOSED' &&
               id > 0;
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
