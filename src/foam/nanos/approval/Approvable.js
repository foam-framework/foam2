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
      of: 'foam.nanos.dao.Operation',
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
    },
    {
      class: 'Boolean',
      name: 'isUsingNestedJournal',
      section: 'admin'
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        var modelString = this.daoKey;

        modelString = modelString.replace('local', '');
        modelString = modelString.replace('DAO', '');

        return this.__subContext__[this.daoKey].find(this.objId).then(obj => {
          return obj 
            ? `${modelString}: ${obj.toSummary()}`
            :  `(${modelString}:${this.objId}) UPDATE`
        });
      },
      javaCode: `
        // TODO: update after crunch time
        if ( foam.util.SafetyUtil.isEmpty(getDaoKey()) || getObjId() == null )
          return "";
        String modelString = getDaoKey().replace("local", "").replace("DAO", "");
        return "(" + modelString + ":" + getObjId() + ") UPDATE";
      `
    }
  ]
});
