/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'Approvable',
  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware'
  ],

  sections: [
    {
      name: 'admin',
      permissionRequired: true
    },
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'lookupId',
      documentation: `
        A function of daoKey, objId and a hashed properties to update, to be used
        to distinguish update requests on the same object
      `,
      required: true,
      section: 'admin',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'daoKey',
      section: 'admin',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'serverDaoKey',
      section: 'admin',
      visibility: 'RO'
    },
    {
      class: 'Object',
      javaType: 'Object',
      name: 'objId',
      section: 'admin',
      visibility: 'RO'
    },
    {
      class: 'Map',
      name: 'propertiesToUpdate'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.approval.ApprovalStatus',
      name: 'status'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.ruler.Operations',
      name: 'operation'
    },
    {
      class: 'Class',
      name: 'of',
    },
    {
      class: 'DateTime',
      name: 'created',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent'
    }
  ],

  methods: [
    {
      name: 'toSummary',
      code: function() {
        var modelString = this.daoKey;

        modelString = modelString.replace('local', '');
        modelString = modelString.replace('DAO', '');

        return `(${modelString}:${this.objId}) UPDATE`;
      }
    }
  ]
});
