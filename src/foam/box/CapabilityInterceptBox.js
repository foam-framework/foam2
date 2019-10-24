/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box',
  name: "CapabilityInterceptReplyDecoratorBox",
  extends: 'foam.box.ProxyBox',

  documentation: `
    This box decorates replyBox of the message with CapabilityInterceptBox
    before sending the message to its delegate.
  `,

  methods: [
    {
      name: 'send',
      javaCode: `
        foam.core.X x = getX();

        msg.getAttributes().put("replyBox",
          new CapabilityInterceptBox.Builder(x)
            .setDelegate((Box) msg.getAttributes().get("replyBox"))
            .build());
        getDelegate().send(msg);
      `
    }
  ]
});

foam.CLASS({
  package: 'foam.box',
  name: 'CapabilityInterceptBox',
  extends: 'foam.box.ProxyBox',

  javaImports: [
    'foam.box.RPCErrorMessage',
    'foam.box.CapabilityRequiredRemoteException',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.Capability',
    'java.util.ArrayList',
    'java.util.List',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'send',
      javaCode: `
        foam.core.X x = getX();

        FindCapabilityIntercept: {
          // Conditions to be met if this is an AuthorizationException reply
          if ( ! (msg.getObject() instanceof RPCErrorMessage) )
            break FindCapabilityIntercept;
          RPCErrorMessage rpcErrMsg = (RPCErrorMessage) msg.getObject();
          if ( ! (rpcErrMsg.getData() instanceof RemoteException) )
            break FindCapabilityIntercept;
          RemoteException remoteEx = (RemoteException) rpcErrMsg.getData();
          if ( ! (remoteEx.getServerObject() instanceof AuthorizationException) )
            break FindCapabilityIntercept;
          AuthorizationException authorEx =
            (AuthorizationException) remoteEx.getServerObject();
          String permission = authorEx.getPermission();
          if ( permission == null || "".equals(permission) )
            break FindCapabilityIntercept;
          
          // Remove permission name from AuthorizationException
          // (it will still be sent if no capabilities were found)
          authorEx.clearPermission();

          // Get services needed to detect capability intercepts
          User user = (User) x.get("user");
          DAO capabilityDAO = (DAO) x.get("capabilityDAO");

          List<String> capabilityOptions = new ArrayList<String>();
          {
            // Find intercepting capabilities
            List<Capability> capabilities =
              ( (ArraySink) capabilityDAO.where(CONTAINS_IC(
                Capability.PERMISSIONS_INTERCEPTED, permission))
                .select(new ArraySink()) ).getArray();
            // Continue to delegate if no capabilities were found
            if ( capabilities.size() < 1 )
              break FindCapabilityIntercept;
            // Populate capabilityOptions
            for ( Capability cap : capabilities )
              capabilityOptions.add(cap.getId());
          }

          // Replace AuthorizationException with CapabilityInterceptException
          rpcErrMsg.setData(new CapabilityRequiredRemoteException.Builder(x)
            .setCapabilityOptions(capabilityOptions.toArray(new String[]{}))
            .build());
        }
        getDelegate().send(msg);
      `
    }
  ]
});