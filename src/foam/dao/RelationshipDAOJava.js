/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.dao.RelationshipDAO',

  methods: [
    {
      name: 'put_',
      javaCode: `return super.put_(x, adaptTarget((foam.core.FObject) getObj(), obj));`
    },
    {
      name: 'adaptTarget',
      javaReturns: 'foam.core.FObject',
      args: [
        {
          name: 'source',
          javaType: 'foam.core.FObject'
        },
        {
          name: 'target',
          javaType: 'foam.core.FObject'
        }
      ],
      javaCode: 
      `
      String inverseName = getRelationship().getInverseName();

      ((RelationshipDAO) target).getRelationship().setInverseName(source.getClassInfo().getId());

      return (foam.core.FObject) target;`
    }
  ]
});
