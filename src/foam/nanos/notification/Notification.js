/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'Notification',

  documentation: 'Notification model responsible for system and integrated messaging notifications.',

  javaImports: [
    'java.util.Date'
  ],

  tableColumns: ['id', 'body', 'notificationType', 'broadcasted', 'userId', 'groupId' ],

  properties: [
    {
      class: 'Boolean',
      name: 'read',
      documentation: 'Determines if notification has been read.',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Long',
      name: 'id',
      visibility: foam.u2.Visibility.RO
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
      class: 'Date',
      name: 'issuedDate',
      factory: function() { return new Date(); },
      label: 'Notification Date',
      documentation: 'Date notification was created.',
      visibility: foam.u2.Visibility.RO
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
      visibility: foam.u2.Visibility.HIDDEN,
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
      class: 'Boolean',
      name: 'emailIsEnabled',
      documentation: 'Determines an email is sent to user.'
    },
    {
      class: 'Boolean',
      name: 'sendSlackMessage',
      documentation: 'Sends notification as a Slack message.'
    },
    {
      class: 'String',
      name: 'slackWebhook',
      documentation: 'Webhook associated to Slack.'
    },
    {
      class: 'String',
      name: 'slackMessage',
      documentation: 'Message to be sent to Slack if sendSlackMessage is enabled.'
    }
  ]
});
