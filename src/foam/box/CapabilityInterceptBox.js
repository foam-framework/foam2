/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box',
  name: 'CapabilityInterceptBox',
  extends: 'foam.box.ProxyBox',

  javaImports: [
    'foam.box.CapabilityRequiredRemoteException',
    'foam.box.RPCErrorMessage',
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

        Throwable t = (Throwable) msg.getLocalAttributes().get("serverThrowable");

        // Conditions to be met if this is an AuthorizationException reply
        if ( ! (msg.getObject() instanceof RPCErrorMessage) || t == null ||
             ! (t instanceof AuthorizationException) ) {
          getDelegate().send(msg);
          return;
        }
        RPCErrorMessage rpcErrMsg = (RPCErrorMessage) msg.getObject();
        AuthorizationException authorEx = (AuthorizationException) t;
        String permission = authorEx.getPermission();
        if ( permission == null || "".equals(permission) ) {
          getDelegate().send(msg);
          return;
        }
        
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
          if ( capabilities.size() < 1 ) {
            getDelegate().send(msg);
            return;
          }
          // Populate capabilityOptions
          for ( Capability cap : capabilities )
            capabilityOptions.add(cap.getId());
        }

        // Replace AuthorizationException with CapabilityInterceptException
        rpcErrMsg.setData(new CapabilityRequiredRemoteException.Builder(x)
          .setCapabilityOptions(capabilityOptions.toArray(new String[]{}))
          .build());

        getDelegate().send(msg);
      `
    }
  ]
});