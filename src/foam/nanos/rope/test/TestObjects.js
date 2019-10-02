/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.rope.test',
  name: 'ROPEUser',

  properties: [
    {
      name: 'id',
      class: 'Long'
    },
    {
      name: 'name',
      class: 'String'
    },
    {
      name: 'organization',
      class: 'String',
      required: true
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.rope.test',
  name: 'ROPEUserDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'put_', 
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      type: 'foam.core.FObject',
      javaCode: `
      if ( obj != null && obj instanceof ROPEUser ) {
        DAO businessDAO = (DAO) x.get("ropeBusinessDAO");

        List<ROPEBusiness> businesses = (List<ROPEBusiness>) ((ArraySink) businessDAO
          .where(EQ(ROPEBusiness.ORGANIZATION, ((ROPEUser) obj).getOrganization()))
          .select(new ArraySink()))
          .getArray();

        ROPEBusiness business;

        if ( businesses.size() <= 0 ) {
          business = new ROPEBusiness();
          business.setId(((ROPEUser) obj).getId()+1);
          business.setName(((ROPEUser) obj).getOrganization() + "Business");
          business.setOrganization(((ROPEUser) obj).getOrganization());
          businessDAO.put(business);
          DAO userDAO = (DAO) x.get("ropeUserDAO");
          userDAO.put_(x, business);
        } else business = businesses.get(0);

        ROPEUserROPEBusinessJunction junction = new ROPEUserROPEBusinessJunction();
        junction.setSourceId(((ROPEUser) obj).getId());
        junction.setTargetId(business.getId());
        DAO agentJunctionDAO = (DAO) x.get("ropeAgentJunctionDAO");
        junction = (ROPEUserROPEBusinessJunction) agentJunctionDAO.put(junction);

        return getDelegate().put_(x, obj);
      }
      return null;
      `
    },
  ]
});

foam.CLASS({
  package: 'foam.nanos.rope.test',
  name: 'ROPEBusiness',
  extends: 'foam.nanos.rope.test.ROPEUser',

  properties: [
    {
      name: 'id',
      class: 'Long'
    },
    {
      name: 'name',
      class: 'String'
    },
    {
      name: 'organization',
      class: 'String',
      required: true
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.rope.test',
  name: 'ROPEBankAccount',

  properties: [
    {
      name: 'id',
      class: 'Long'
    },
    {
      name: 'name',
      class: 'String'
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.rope.test',
  name: 'ROPETransaction',

  properties: [
    {
      name: 'id',
      class: 'Long'
    },
    {
      name: 'name',
      class: 'String'
    }
  ]
});


foam.RELATIONSHIP({
  cardinality: '*:*',
  sourceModel: 'foam.nanos.rope.test.ROPEUser',
  targetModel: 'foam.nanos.rope.test.ROPEBusiness',
  sourceDAOKey: 'ropeUserDAO',
  targetDAOKey: 'ropeUserDAO',
  forwardName: 'entities',
  inverseName: 'agents',
  junctionDAOKey: 'ropeAgentJunctionDAO'
});

foam.RELATIONSHIP({
  cardinality: '*:*',
  sourceModel: 'foam.nanos.rope.test.ROPEUser',
  targetModel: 'foam.nanos.rope.test.ROPEUser',
  sourceDAOKey: 'ropeUserDAO',
  targetDAOKey: 'ropeUserDAO',
  forwardName: 'partners',
  inverseName: 'partnered',
  junctionDAOKey: 'ropePartnerJunctionDAO'
});

foam.RELATIONSHIP({
  cardinality: '*:*',
  sourceModel: 'foam.nanos.rope.test.ROPEBusiness',
  targetModel: 'foam.nanos.rope.test.ROPEBusiness',
  sourceDAOKey: 'ropeUserDAO',
  targetDAOKey: 'ropeUserDAO',
  forwardName: 'contacts',
  inverseName: 'owner',
  junctionDAOKey: 'ropeContactDAO'
});

foam.CLASS({
  package: 'foam.nanos.rope.test',
  name: 'ROPEContactDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'put_', 
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      type: 'foam.core.FObject',
      javaCode: `
      if ( obj != null ) {
        ROPEBusinessROPEBusinessJunction inverse = new ROPEBusinessROPEBusinessJunction();
        inverse.setSourceId(((ROPEBusinessROPEBusinessJunction) obj).getTargetId());
        inverse.setTargetId(((ROPEBusinessROPEBusinessJunction) obj).getSourceId());
        getDelegate().put_(x, inverse);
        return getDelegate().put_(x, obj);
      }
      return null;
      `
    },
  ]
});

foam.RELATIONSHIP({
  cardinality: '*:*',
  sourceModel: 'foam.nanos.rope.test.ROPEBusiness',
  targetModel: 'foam.nanos.rope.test.ROPEUser',
  sourceDAOKey: 'ropeBusinessDAO',
  targetDAOKey: 'ropeUserDAO',
  forwardName: 'signingOfficers',
  inverseName: 'businessesInWhichThisUserIsASigningOfficer',
  junctionDAOKey: 'ropeSigningOfficerJunctionDAO'
});

foam.RELATIONSHIP({
  cardinality: '1:*',
  sourceModel: 'foam.nanos.rope.test.ROPEUser',
  targetModel: 'foam.nanos.rope.test.ROPEBankAccount',
  sourceDAOKey: 'ropeUserDAO',
  targetDAOKey: 'ropeAccountDAO',
  forwardName: 'bankaccounts',
  inverseName: 'accountOwner',
  targetDAOKey: 'ropeAccountDAO'
});

foam.RELATIONSHIP({
  cardinality: '1:*',
  sourceModel: 'foam.nanos.rope.test.ROPEBankAccount',
  targetModel: 'foam.nanos.rope.test.ROPETransaction',
  sourceDAOKey: 'ropeAccountDAO',
  targetDAOKey: 'ropeTransactionDAO',
  forwardName: 'debits',
  inverseName: 'sourceAccount',
  targetDAOKey: 'ropeTransactionDAO'
});

foam.RELATIONSHIP({
  cardinality: '1:*',
  sourceModel: 'foam.nanos.rope.test.ROPEBankAccount',
  targetModel: 'foam.nanos.rope.test.ROPETransaction',
  sourceDAOKey: 'ropeAccountDAO',
  targetDAOKey: 'ropeTransactionDAO',
  forwardName: 'credits',
  inverseName: 'destinationAccount',
  targetDAOKey: 'ropeTransactionDAO'
});
