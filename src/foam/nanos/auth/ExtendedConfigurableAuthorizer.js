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
    Configurable authorizer provides a service DAO access control using permissions and permission templates.
    The authorizer is capable of providing StandardAuthorizer behaviour along with it's configurated authorization
    using enableStandardAuthorizer which is applied by default.

    The authorizer requires the use of configurable permission templates defined in permissionTemplateReferenceDAO.
    Template reference DAOKeys detail when to apply to an authorizer. An authorizer must define its own daoKey.

    * Permissions created from templates are lowercase.

    Please see PermissionTemplateReference.js for further documentation.
  `,

  javaImports: [
  'foam.core.Detachable',
  'foam.core.FObject',
  'foam.core.X',
  'foam.dao.ArraySink',
  'foam.dao.DAO',
  'foam.dao.Sink',
  'foam.mlang.predicate.Predicate',
  'foam.nanos.ruler.Operations',
  'foam.nanos.session.Session',
  'java.util.ArrayList',
  'java.util.List',
  'java.util.Map',
  'java.util.concurrent.ConcurrentHashMap',

  'static foam.mlang.MLang.TRUE'
  ],

  constants: [
    { name: 'CACHE_KEY', value: 'permissionTemplateCache' }
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
      name: 'enableStandardAuthorizer',
      value: true,
      documentation: `Enables default operation permissions identical to the StandardAuthorizer.
          ex: model.read.id || model.read.* etc..
      `
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
        for (PermissionTemplateProperty templateProperty : permissionTemplate.getProperties()) {
          String propertyName = templateProperty.getPropertyReference();
            permission += templateProperty.getImpliesValue() ?
                "." + propertyName + "[" + obj.getProperty(propertyName) + "]" :
                "." + obj.getProperty(propertyName);
        }
        return permission.toLowerCase();
      `
    },
    {
      name: 'purgeCache',
      args: [ {type: 'X', name: 'x' } ],
      type: 'Void',
      javaCode: `
        Session session = x.get(Session.class);
        session.setContext(session.getContext().put(CACHE_KEY, null));
      `
    },
    {
      name: 'getTemplateCache',
      type: 'Map<String,List>',
      args: [
        { type: 'X', name: 'x' }
      ],
      javaCode:  `
        Session session = x.get(Session.class);
        Map<String, List> cache = (Map) session.getContext().get(CACHE_KEY);

        if ( cache == null ) {
          Sink purgeSink = new Sink() {
            public void put(Object obj, Detachable sub) {
              purgeCache(x);
              sub.detach();
            }
            public void remove(Object obj, Detachable sub) {
              purgeCache(x);
              sub.detach();
            }
            public void eof() {
            }
            public void reset(Detachable sub) {
              purgeCache(x);
              sub.detach();
            }
          };

          DAO permissionTemplateReferenceDAO = (DAO) x.get("localPermissionTemplateReferenceDAO");
          permissionTemplateReferenceDAO.listen(purgeSink, TRUE);
          cache = new ConcurrentHashMap<String, List>();
          List<PermissionTemplateReference> templates = ((ArraySink) permissionTemplateReferenceDAO.select(new ArraySink())).getArray();
          for ( var template : templates ) {
            String[] daoKeys = template.getDaoKeys();
            for ( var daoKey : daoKeys ) {
              List<PermissionTemplateReference> references = cache.containsKey(daoKey) ?
                  cache.get(daoKey) : new ArrayList<PermissionTemplateReference>();
              references.add(template);
              cache.put(daoKey, references);
            }
          }
          session.setContext(session.getContext().putFactory(CACHE_KEY, new SessionContextCacheFactory(cache)));
        }
    
        return cache;
      `
    },
    {
      name: 'createStandardAuthorizationTemplate',
      type: 'PermissionTemplateReference',
      args: [
        { type: 'Operations', name: 'op' }
      ],
      javaCode: `
        PermissionTemplateReference template = new PermissionTemplateReference();
        template.setOperation(op);
        if ( op != Operations.CREATE ) {
          PermissionTemplateProperty templateProperties = new PermissionTemplateProperty();
          templateProperties.setPropertyReference("id");
          template.setProperties(new PermissionTemplateProperty[] { templateProperties } );
        }
        return template;
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
        AuthService authService = (AuthService) x.get("auth");
        Map<String,List> cache = (Map<String,List>) getTemplateCache(x);
        List<PermissionTemplateReference> templates = (List<PermissionTemplateReference>) cache.get(getDAOKey());
        if ( getEnableStandardAuthorizer() ) {
          if ( templates == null ) {
            templates = new ArrayList<PermissionTemplateReference>();
          }
          templates.add(createStandardAuthorizationTemplate(op));
        }
        if ( templates != null && ! templates.stream().filter(t -> t.getOperation().equals(op)).anyMatch(t -> authService.check(x, createPermission((PermissionTemplateReference) t, obj))) ) {
          ((foam.nanos.logger.Logger) x.get("logger")).debug("ExtendedConfigurableAuthorizer", "Permission denied");
          throw new AuthorizationException();
        }
      `
    },
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
