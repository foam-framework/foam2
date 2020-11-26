/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'FOAMException',
  package: 'foam.core',
  implements: [ 'foam.core.Exception' ],
  javaExtends: 'RuntimeException',
  javaGenerateConvenienceConstructor: false,
  
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public FOAMException(String message) {
    super(message);
    setMessage_(message);
    getHostname();
  }

  public FOAMException(Throwable cause) {
    super(cause);
    setMessage_(cause.getMessage());
    getHostname();
  }

  public FOAMException(String message, Throwable cause) {
    super(message, cause);
    setMessage_(message);
    getHostname();
  }
        `);
      }
    }
  ],

  properties: [
    {
      name: 'javaGenerateConvenienceConstructor',
      value: false,
      transient: true,
      visibility: 'HIDDEN'
    },
    {
      name: 'message_',
      class: 'String',
      visibility: 'RO'
    },
    {
      name: 'hostname',
      class: 'String',
      javaFactory: 'return System.getProperty("hostname", "localhost");',
      visibilty: 'RO'
    }
  ],
  
  methods: [
    {
      name: 'getMessage',
      type: 'String',
      javaCode: `
      String msg = getMessage_();
      if ( foam.util.SafetyUtil.isEmpty(msg) ) {
        return super.getMessage();
      }
      return msg;
      `
    },
    {
      name: 'toString',
      type: 'String',
      javaCode: `
      return "["+getHostname()+"],"+this.getClass().getName()+","+super.getMessage();
      `
    }
  ]
});
