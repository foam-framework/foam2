/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ExtendedConfigurableAuthorizer',
  implements: ['foam.nanos.auth.Authorizer'],

  documentation: `
    Configurable authorizer allowing the use of configurable permissions templates defined in permissionTemplateReferenceDAO. 
    Templates reference DAOKeys detailing when to apply to an authorizer. An authorizer must define its own daoKey.
    Allows for grouped object access based on object values and template configuration.
    Please see PermissionTemplateReference.js for additional documentation`,

  javaImports: [
  'foam.core.FObject',
  'foam.core.X',
  'foam.dao.ArraySink',
  'foam.dao.DAO',
  'foam.mlang.predicate.Predicate',
  'foam.nanos.ruler.Operations',
  'java.util.List',

  'static foam.mlang.MLang.AND',
  'static foam.mlang.MLang.EQ',
  'static foam.mlang.MLang.IN'
  ],

  properties: [
    {
      class: 'String',
      name: 'DAOKey',
      documentation: `Defines the daokey segment of the permission pertaining to your service.
          Checked in permission templates and applied in authorizer.`
    },
    {
      class: 'Boolean',
      name: 'defaultAuthorization',
      documentation: `Setting this to true will include daokey.read, daokey.update, daokey.remove 
          permission checks in their respective operation call to maintain standard authorization logic.`
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public ExtendedConfigurableAuthorizer(X x) {
            setX(x);
            DAO permissionTemplateDAO = (DAO) x.get("localPermissionTemplateReferenceDAO");
            PermissionTemplateCache permissionTemplateCache = (PermissionTemplateCache) x.get("permissionTemplateCache");

            Map<String, List> cachedTemplates = (Map<String, List>) permissionTemplateCache.getCache();

            Predicate predicate = (Predicate) AND(
              IN(getDAOKey(), PermissionTemplateReference.DAO_KEYS)
            );
    
            List<PermissionTemplateReference> templates = ((ArraySink) permissionTemplateDAO.where(predicate).select(new ArraySink())).getArray();
            cachedTemplates.put(getDAOKey(), templates);
            permissionTemplateCache.setCache(cachedTemplates);
            x.put("permissionTemplateCache", permissionTemplateCache);
          }
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'createPermission',
      type: 'String',
      args: [
        { type: 'PermissionTemplateReference', name: 'permissionTemplate' }, 
        { type: 'FObject', name: 'obj'}
      ],
      documentation: `Construct permission from permission template reference.`,
      javaCode: `
        String permission = getDAOKey() + "." + ((Operations) permissionTemplate.getOperation()).getLabel();
        for (String prop : permissionTemplate.getProperties()) {
          permission += "." + obj.getProperty(prop);
        }
        return permission.toLowerCase();
      `
    },
    {
      name: 'checkPermissionTemplates',
      type: 'Void',
      args: [
        { type: 'X', name: 'x' },
        { type: 'Operations', name: 'op' },
        { type: 'FObject', name: 'obj' }
      ],
      documentation: `Check if user permissions match any of the template and object constructed permissions`,
      javaCode:  `
        PermissionTemplateCache permissionTemplateCache = (PermissionTemplateCache) x.get("permissionTemplateCache");
        AuthService authService = (AuthService) x.get("auth");

        List<PermissionTemplateReference> templates = (List<PermissionTemplateReference>) permissionTemplateCache.getPermissionListOf(getDAOKey());
        if ( ! templates.stream().anyMatch(t -> authService.check(x, createPermission((PermissionTemplateReference) t, obj))) ) {
          ((foam.nanos.logger.Logger) x.get("logger")).debug("ExtendedConfigurableAuthorizer", "Permission denied");
          throw new AuthorizationException();
        }
      `
    },
    // {
    //   name: 'checkPermissionTemplates',
    //   type: 'Void',
    //   args: [
    //     { type: 'X', name: 'x' },
    //     { type: 'Operations', name: 'op' },
    //     { type: 'FObject', name: 'obj' }
    //   ],
    //   documentation: `Check if user permissions match any of the template and object constructed permissions`,
    //   javaCode:  `
    //     AuthService authService = (AuthService) x.get("auth");
    //     DAO permissionTemplateDAO = (DAO) x.get("localPermissionTemplateReferenceDAO");

    //     Predicate predicate = (Predicate) AND(
    //       IN(getDAOKey(), PermissionTemplateReference.DAO_KEYS),
    //       EQ(PermissionTemplateReference.OPERATION, op)
    //     );

    //     List<PermissionTemplateReference> templates = ((ArraySink) permissionTemplateDAO.where(predicate).select(new ArraySink())).getArray();
    //     if ( ! templates.stream().anyMatch(t -> authService.check(x, createPermission((PermissionTemplateReference) t, obj))) ) {
    //       ((foam.nanos.logger.Logger) x.get("logger")).debug("ExtendedConfigurableAuthorizer", "Permission denied");
    //       throw new AuthorizationException();
    //     }
    //   `
    // },
    {
      name: 'authorizeOnCreate',
      javaCode: `
        checkPermissionTemplates(x, Operations.CREATE, obj);
      `
    },
    {
      name: 'authorizeOnRead',
      javaCode: `
        checkPermissionTemplates(x, Operations.READ, obj);
      `
    },
    {
      name: 'authorizeOnUpdate',
      javaCode: `
        checkPermissionTemplates(x, Operations.UPDATE, oldObj);
      `
    },
    {
      name: 'authorizeOnDelete',
      javaCode:`
        checkPermissionTemplates(x, Operations.REMOVE, obj);
      `
    },
    {
      name: 'checkGlobalRead',
      javaCode: `
        String permission = getDAOKey() + ".read.*";
        AuthService authService = (AuthService) x.get("auth");
        try {
          return authService.check(x, permission);
        } catch ( AuthorizationException e ) {
          return false;
        }
      `
    },
    {
      name: 'checkGlobalRemove',
      javaCode: `
        String permission = getDAOKey() + ".remove.*";
        AuthService authService = (AuthService) x.get("auth");
        try {
          return authService.check(x, permission);
        } catch ( AuthorizationException e ) {
          return false;
        }
      `
    },
  ]
});
