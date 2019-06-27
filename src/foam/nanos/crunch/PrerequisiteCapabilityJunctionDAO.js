foam.CLASS({
    package: 'foam.nanos.crunch',
    name: 'PrerequisiteCapabilityJunctionDAO',
    extends: 'foam.dao.ProxyDAO',
  
    documentation: `TODO On the junctionDAO put should set all deprecated capabilities' enabled to false and update UserCapabilityJunction.`,
  
    javaImports: [
      'foam.nanos.crunch.Capability',
      'foam.nanos.crunch.UserCapabilityJunction',
      'foam.nanos.crunch.CapabilityJunctionStatus',
      'foam.dao.ArraySink',
      'foam.dao.DAO',
      'java.util.List',
      'static foam.mlang.MLang.*'
    ],
  
    methods: [
    ]
  });
  