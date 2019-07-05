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
        var type = this.type;
        var isContextOriented =  this.args.length >= 1 && this.args[0].type == 'Context'
        var replyPolicyName   = this.replyPolicyName;
        var boxPropName       = this.boxPropName;
        var name              = this.name;

        return function() {
          var replyBox = this.RPCReturnBox.create();
          var ret      = replyBox.promise;

          var replyBox = this.OneTimeBox.create({
            delegate: replyBox
          });

          var exportBox = this.registry.register(null, null, replyBox);

          replyBox.onDetach(exportBox);

          // Automatically wrap RPCs that return a "PromisedAbc" or similar
          // TODO: Move this into RPCReturnBox ?
          var cls = this.__context__.lookup(type, true);
          if ( cls && ! cls.name.startsWith('Promised') ) {
            var promiseType = `${cls.package}.Promised${cls.name}`
            cls = this.__context__.lookup(promiseType, true)
          }
          ret = cls ? cls.create({ delegate: ret }) : ret;

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

          msg.attributes.replyBox = exportBox;

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

        if ( this.javaType && this.javaType !== 'void' ) {
          code += `if ( result instanceof foam.box.RPCReturnMessage )
  return (${this.javaType})((foam.box.RPCReturnMessage)result).getData();
`;
        }

        code += `if ( result instanceof java.lang.Throwable )
  throw new RuntimeException((java.lang.Throwable)result);

if ( result instanceof foam.box.RPCErrorMessage )
  throw new RuntimeException(((foam.box.RPCErrorMessage)result).getData().toString());
`;

        if ( this.javaType && this.javaType !== 'void') {
          code += `throw new RuntimeException("Invalid response type: " + result.getClass());`;
        }

        this.javaCode = code;

        this.SUPER(cls);
      }
    }
  ]
});
