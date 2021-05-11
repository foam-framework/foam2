/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'Notification',
  plural: 'notifications',

  implements: [
    'foam.nanos.auth.Authorizable',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.medusa.Clusterable',
    'foam.nanos.auth.ServiceProviderAware'
  ],

  documentation: 'Notification model responsible for system and integrated messaging notifications.',

  javaImports: [
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User'
  ],

  import: [
    'resendNotificationService',
    'notify'
  ],

  requires: [
    'foam.log.LogLevel'
  ],

  tableColumns: [
    'id',
    'body',
    'notificationType',
    'broadcasted',
    'userId.id',
    'groupId.id'
  ],

  sections: [
    {
      name: 'default_',
      order: 1
    },
    {
      name: 'systemInformation',
      help: 'Properties that are used internally by the system.',
      title: 'System Information',
      order: 2,
      permissionRequired: true
    },
  ],

  axioms: [
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Unread',
      predicateFactory: function(e) {
        return e.AND(
          e.EQ(foam.nanos.notification.Notification.READ, false),
        );
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Read',
      predicateFactory: function(e) {
        return e.AND(
          e.EQ(foam.nanos.notification.Notification.READ, true),
        );
      }
    }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'read',
      documentation: 'Determines if notification has been read.',
      visibility: 'RO'
    },
    {
      class: 'Long',
      name: 'id',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'hostname',
      visibility: 'RO',
      javaFactory: 'return System.getProperty("hostname", "localhost");'
    },
    {
      class: 'String',
      name: 'template'
    },
    {
      class: 'String',
      name: 'notificationType',
      label: 'Notification type',
      documentation: 'Type of notification.',
      value: 'General'
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: 'Creation date.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'User that created the Notification.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      documentation: 'Agent user that created the Notification.',
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'Date',
      name: 'expiryDate',
      documentation: 'Expiration date of notification.',
      factory: function() {
        // 90 days since creation date
        return new Date(Date.now() + (90 * 24 * 60 * 60 * 1000));
      }
    },
    {
      class: 'String',
      name: 'body',
      documentation: 'Notification body'
    },
    {
      class: 'String',
      name: 'toastMessage',
      documentation: 'Toast notification message'
    },
    {
      class: 'String',
      name: 'toastSubMessage',
      documentation: 'Toast notification description'
    },
    {
      class: 'Enum',
      name: 'toastState',
      of: 'foam.nanos.notification.ToastState'
    },
    {
      class: 'Enum',
      name: 'severity',
      of: 'foam.log.LogLevel'
    },
    {
      class: 'Boolean',
      name: 'transient'
    },
    {
      class: 'String',
      name: 'icon'
    },
    {
      class: 'Boolean',
      name: 'broadcasted',
      documentation: 'Determines if notification is sent to all users in a group or system.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'userId',
      documentation: 'User notification will be sent to.',
      view: { class: 'foam.u2.view.ReferenceView', placeholder: 'select user' }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Group',
      name: 'groupId',
      documentation: 'Group notification will be sent to.',
      view: { class: 'foam.u2.view.ReferenceView', placeholder: 'select group' }
    },
    {
      class: 'Map',
      name: 'emailArgs',
      visibility: 'HIDDEN',
      documentation: 'Arguments for email template.',
      javaFactory: 'return new java.util.HashMap<String, Object>();'
    },
    {
      class: 'String',
      name: 'emailName',
      label: 'Email template name',
      value: 'notification',
      documentation: 'Email template name.'
    },
    {
      class: 'String',
      name: 'slackWebhook',
      documentation: 'Webhook associated to Slack.'
    },
    {
      class: 'String',
      name: 'slackMessage',
      documentation: 'Message to be sent to Slack.'
    },
    {
      class: 'Boolean',
      name: 'clusterable',
      value: true,
      includeInDigest: false
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
      includeInDigest: true,
      tableWidth: 120,
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
    }
  ],

  messages: [
    { name: 'SEND_SUCCESS', message: 'Notification successfully resent' },
    { name: 'SEND_FAILED',  message: 'Notification could not be resent' }
  ],

  methods: [
    {
      name: 'checkOwnership',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Boolean',
      javaCode: `
        User user = ((Subject) x.get("subject")).getRealUser();
        return user != null && getUserId() == user.getId();
      `
    },
    {
      name: 'authorizeOnCreate',
      javaCode: `
      AuthService auth = (AuthService) x.get("auth");
      if ( ! checkOwnership(x) && ! auth.check(x, createPermission("create")) && ! getTransient() ) throw new AuthorizationException("You don't have permission to create this notification.");
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
      AuthService auth = (AuthService) x.get("auth");
      if ( ! checkOwnership(x) && ! auth.check(x, createPermission("update")) && ! getTransient() ) throw new AuthorizationException("You don't have permission to update notifications you do not own.");
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode: `
      AuthService auth = (AuthService) x.get("auth");
      if ( ! checkOwnership(x) && ! auth.check(x, "*") ) throw new AuthorizationException("You don't have permission to delete notifications you do not own.");
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
      AuthService auth = (AuthService) x.get("auth");
      if ( ! checkOwnership(x) && ! auth.check(x, createPermission("read")) ) throw new AuthorizationException("You don't have permission to read notifications you do not own.");
      `
    },
    {
      name: 'createPermission',
      args: [
        { name: 'operation', type: 'String' }
      ],
      type: 'String',
      javaCode: `
        return "notification." + operation + "." + getId();
      `
    }
  ],

  actions: [
    {
      name: 'resendNotification',
      label: 'Resend Notification',
      availablePermissions:['notification.notify'],
      code: function(X) {
        var self = this;
        X.resendNotificationService.resend(X, this.userId, this).then(function() {
          X.notify(self.SEND_SUCCESS, '', self.LogLevel.INFO, true);
        }).catch(function(e) {
          X.notify(self.SEND_FAILED, '', self.LogLevel.ERROR, true);
        });
      }
    }
  ]
});
