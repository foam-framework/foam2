/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'SUGAR',

  documentation: 'SUGAR : Service Unified GAteway Relay - Perform non-DAO operations against a web service',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  tableColumns: [
    'id'
  ],

  requires: [
    'foam.nanos.dig.Argument',
    'foam.net.web.HTTPRequest'
  ],

  css: `
    .property-argumentInfo button {
      display: none;
    }
  `,

  constants: [
    {
      name: 'MAX_URL_SIZE',
      value: 2000,
      type: 'Integer'
    }
  ],

  sections: [
    {
      name: 'details'
    },
    {
      name: 'supportDetails'
    },
    {
      name: '_defaultSection',
      permissionRequired: true
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      displayWidth: 40,
      section: 'details'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      section: 'supportDetails'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      section: 'supportDetails'
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: 'The date and time of when the User was created in the system.',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      section: 'administrative',
      includeInDigest: true,
      section: 'supportDetails'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: 'The date and time the User was last modified.',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      section: 'administrative',
      storageOptional: true,
      section: 'supportDetails'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      section: 'supportDetails',
      readPermissionRequired: true,
      writePermissionRequired: true,
      storageOptional: true,
      section: 'supportDetails'
    },
    {
      class: 'String',
      name: 'data',
      value: `{
  "service":"service-name",
  "method":"method-name",
  "interfaceName":"foam.nanos.interface-name",
  "numberArg":8023,
  "stringArg":"my-string"
}`,
      view: { class: 'foam.u2.tag.TextArea', rows: 16, cols: 137 },
      visibility: 'RW',
      section: 'details'
    },
    {
      class: 'String',
      name: 'result',
      value: 'No Request Sent Yet.',
      view: { class: 'foam.u2.tag.TextArea', rows: 20, cols: 137 },
      createVisibility: 'RO',
      updateVisibility: 'RO',
      section: 'details'
    }
  ],

  actions: [
    {
      name: 'postButton',
      label: 'Send POST Request',
      code: async function() {
        var req = this.HTTPRequest.create({
          url: window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/service/sugar?sessionId=' + localStorage.defaultSession,
          method: 'POST',
          payload: this.data
        }).send();

        var resp = await req.then(async function(resp) {
          var temp = await resp.payload.then(function(result) {
            return result;
          });
          return temp;
        }, async function(error) {
          var temp = await error.payload.then(function(result) {
            return result;
          });
          return temp;
        });

        this.result = resp;
      }
    }
  ]
});