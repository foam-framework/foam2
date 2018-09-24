/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'StubMethod',
  extends: 'Method',

  properties: [
    'replyPolicyName',
    'boxPropName',
    {
      name: 'code',
      factory: function() {
        var returns = this.returns;
        var isContextOriented =  this.args.length >= 1 && this.args[0].type == 'Context'
        var replyPolicyName   = this.replyPolicyName;
        var boxPropName       = this.boxPropName;
        var name              = this.name;

        return function() {
          var replyBox = this.RPCReturnBox.create();
          var ret      = replyBox.promise;

          // Automatically wrap RPCs that return a "PromisedAbc" or similar
          // TODO: Move this into RPCReturnBox ?
          if ( this.__context__.lookup(returns, true) && this.__context__.lookup(returns).name.startsWith('Promised') ) {
            ret = this.__context__.lookup(returns).create({ delegate: ret });
          }

          var args = Array.from(arguments);

          // Don't try to marshal context across network They are not
          // serializable and the server will assign its own notion of
          // what context the request should be handled in.
          if ( isContextOriented ) args[0] = null;

          var msg = this.Message.create({
            object: this.RPCMessage.create({
              name: name,
              args: args
            })
          });

          msg.attributes.replyBox = replyBox;

          this[boxPropName].send(msg);

          return ret;
        };
      }
    }
  ],
  
  methods: [
    {
      name: 'buildJavaClass',
      flags: [ 'java' ],
      code: function buildJavaClass(cls) {
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
    }
  ]
});
