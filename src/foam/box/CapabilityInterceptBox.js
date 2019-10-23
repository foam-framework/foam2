/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box',
  name: 'CapabilityInterceptBox',
  extends: 'foam.box.ProxyBox',

  javaImports: [
    'foam.box.RPCErrorMessage',
    'foam.box.CapabilityRequiredRemoteException'
  ],

  methods: [
    {
      name: 'send',
      javaCode: `
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
          if ( permission == null || "".equals(permission )
            break FindCapabilityIntercept;

          // Get services needed to detect capability intercepts
          User user = (User) x.get("user");
          DAO capabilityDAO = (DAO) x.get("capabilityDAO");

          List<String> capabilityOptions = new ArrayList<>();
          {
            // Find intercepting capabilities
            List<Capability> capabilities =
              ( (ArraySink) capabilityDAO.where(CONTAINS(
                Capability.PERMISSIONS_INTERCEPTED, permission)) ).getArray();
            // Continue to delegate if no capabilities were found
            if ( capabilities.size() < 1 )
              break FindCapabilityIntercept;
            // Populate capabilityOptions
            for ( Capability cap : capabilities )
              capabilityOptions.add(cap.getId());
          }

          // Replace AuthorizationException with CapabilityInterceptException
          rpcErrMsg.setData(new CapabilityRequiredRemoteException.Builder()
            .setCapabilityOptions(capabilityOptions.toArray())
            .build());
        }
        getDelegate().send(msg);
      `
    }
  ]
});