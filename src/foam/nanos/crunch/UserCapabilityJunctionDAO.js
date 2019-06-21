foam.CLASS({
    package: 'foam.nanos.crunch',
    name: 'UserCapabilityJunctionDAO',
    extends: 'foam.dao.ProxyDAO',
  
    documentation: `TODO UserCapabilityJunctionDAO requires a custom authenticated DAO decorator to only show capabilities owned by a user. Updates can only be performed by system.`,
  
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
  