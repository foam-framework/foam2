foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'Notification',

  documentation: 'Notification model',

  javaImports: [
    'java.util.Date'
  ],

  tableColumns: ['id', 'body', 'notificationType', 'broadcasted', 'userId', 'groupId' ],

  properties: [
    {
      class: 'Boolean',
      name: 'read',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Long',
      name: 'id',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'notificationType',
      label: 'Notification type',
      value: 'General'
    },
    {
      class: 'Date',
      name: 'issuedDate',
      factory: function() { return new Date(); },
      label: 'Notification Date',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Date',
      name: 'expiryDate',
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
      class: 'Boolean',
      name: 'broadcasted'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'userId',
      view: { class: 'foam.u2.view.ReferenceView', placeholder: 'select user' }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Group',
      name: 'groupId',
      view: { class: 'foam.u2.view.ReferenceView', placeholder: 'select group' }
    },
    {
      class: 'Map',
      name: 'emailArgs',
      visibility: foam.u2.Visibility.HIDDEN,
      documentation: 'Arguments for email template',
      javaFactory: 'return new java.util.HashMap<String, Object>();'
    },
    {
      class: 'String',
      name: 'emailName',
      label: 'Email template name',
      value: 'notification',
      documentation: 'Email template name'
    },
    {
      class: 'Boolean',
      name: 'emailIsEnabled'
    }
  ]
});
