/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  refines: 'foam.core.StubMethod',

  methods: [
    function buildJavaClass(cls) {
      if ( ! this.javaSupport ) return;

      var name = this.name;
      var args = this.args;
      var boxPropName = foam.String.capitalize(this.boxPropName);
      var replyPolicyName = foam.String.capitalize(this.replyPolicyName);

      var code = `
foam.box.Message message = getX().create(foam.box.Message.class);
foam.box.RPCMessage rpc = getX().create(foam.box.RPCMessage.class);
rpc.setName("${name}");
Object[] args = { ${ args.map( a => a.name ).join(',') } };
rpc.setArgs(args);

message.setObject(rpc);`;

      if ( this.javaReturns && this.javaReturns !== 'void' ) {
        code += `foam.box.RPCReturnBox replyBox = getX().create(foam.box.RPCReturnBox.class);

message.getAttributes().put("replyBox", replyBox);
`;
      }

      code += `get${boxPropName}().send(message);`;

      if ( this.javaReturns && this.javaReturns !== 'void' ) {
        code += `try {
  replyBox.getSemaphore().acquire();
} catch (InterruptedException e) {
  throw new RuntimeException(e);
}

Object result = replyBox.getMessage().getObject();

if ( result instanceof foam.box.RPCReturnMessage )
  return (${this.javaReturns})((foam.box.RPCReturnMessage)result).getData();

if ( result instanceof java.lang.Throwable )
  throw new RuntimeException((java.lang.Throwable)result);

if ( result instanceof foam.box.RPCErrorMessage )
  throw new RuntimeException(((foam.box.RPCErrorMessage)result).getData().toString());

throw new RuntimeException("Invalid repsonse type: " + result.getClass());
`;
      }

      this.javaCode = code;

      this.SUPER(cls);
    }
  ]
});
