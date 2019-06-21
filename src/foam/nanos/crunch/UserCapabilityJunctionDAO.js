foam.CLASS({
    package: 'foam.nanos.crunch',
    name: 'UserCapabilityJunctionDAO',
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
    //   {
    //     name: 'put_', 
    //     args: [
    //       {
    //         name: 'x',
    //         type: 'Context'
    //       },
    //       {
    //         name: 'obj',
    //         type: 'foam.core.FObject'
    //       }
    //     ],
    //     type: 'foam.core.FObject',
    //     documentation: `
    //     `,
    //     javaCode: `

    //     `
    //   },
    ]
  });
  