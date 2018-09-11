/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.StubMethod',
  flags: ['java'],

  methods: [
    function buildJavaClass(cls) {
      if ( ! this.javaSupport ) return;

      var name = this.name;
      var args = this.args;
      var boxPropName = foam.String.capitalize(this.boxPropName);

      var code =
`foam.box.Message message = getX().create(foam.box.Message.class);
foam.box.RPCMessage rpc = getX().create(foam.box.RPCMessage.class);
rpc.setName("${name}");
Object[] args = { ${ args.map( a => a.name ).join(',') } };
rpc.setArgs(args);

message.setObject(rpc);
foam.box.RPCReturnBox replyBox = getX().create(foam.box.RPCReturnBox.class);
message.getAttributes().put("replyBox", replyBox);
get${boxPropName}().send(message);
try {
  replyBox.getSemaphore().acquire();
} catch (Throwable t) {
  throw new RuntimeException(t);
}

Object result = replyBox.getMessage().getObject();
`;

      if ( this.javaReturns && this.javaReturns !== 'void' ) {
        code += `if ( result instanceof foam.box.RPCReturnMessage )
  return (${this.javaReturns})((foam.box.RPCReturnMessage)result).getData();
`;
}

code += `if ( result instanceof java.lang.Throwable )
  throw new RuntimeException((java.lang.Throwable)result);

if ( result instanceof foam.box.RPCErrorMessage )
  throw new RuntimeException(((foam.box.RPCErrorMessage)result).getData().toString());
`;

      if ( this.javaReturns && this.javaReturns !== 'void') {
        code += `throw new RuntimeException("Invalid response type: " + result.getClass());`;
      }

      this.javaCode = code;

      this.SUPER(cls);
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.StubNotification',
  flags: ['java'],

  methods: [
    function buildJavaClass(cls) {
      if ( ! this.javaSupport ) return;

      var name = this.name;
      var args = this.args;
      var boxPropName = foam.String.capitalize(this.boxPropName);

      var code =
`foam.box.Message message = getX().create(foam.box.Message.class);
foam.box.RPCMessage rpc = getX().create(foam.box.RPCMessage.class);
rpc.setName("${name}");
Object[] args = { ${ args.map( a => a.name ).join(',') } };
rpc.setArgs(args);

message.setObject(rpc);
get${boxPropName}().send(message);
`;

      this.javaCode = code;

      this.SUPER(cls);
    }
  ]
});
