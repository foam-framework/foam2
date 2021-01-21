/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'CachePermissionTemplateDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.X',
    'foam.core.Detachable',
    'foam.core.X',
    'foam.dao.AbstractSink'
  ],

  methods: [
    {
      name: 'refreshPermissionTemplateCache',
      args: [
        { type: 'X', name: 'x' },
        { type: 'PermissionTemplateCache', name: 'obj' }
      ],
      javaCode: `
        PermissionTemplateCache permissionTemplateCache = (PermissionTemplateCache) x.get("permissionTemplateCache");
        Map<String, List> newTemplateList = new Map<String, List>();
        if ( obj ) {
          Map<String, List> cache = (Map<String, List>) permissionTemplateCache.getCache();
          if ( cache.containsKey(obj.getDAOKey()) ) {
            PermissionTemplateReference[] references = (permissionTemplateReference[]) cache.get(obj.getDAOKey()); 
            PermissionTemplateReference reference = references.stream().filter(reference -> ((String) reference.getId()).equals(obj.getId())).findAny();
            if ( reference != null ) {
              references.add(obj);
            } else if ( ! reference.equal(obj) ) {
              // TODO:  Remove item from list and replace. 
            }
          }
        } else {
          PermissionTemplateReference[] templates = (PermissionTemplateReferences[]) ((ArraySink) getDelegate().select(new ArraySink())).getArray();
          for ( PermissionTemplateReference template : templates ) {
            if ( newTemplateList.containsKey(template.getDAOKey()) ) {
              PermissionTemplateReference[] populatedTemplates = newTemplateList.get(template.getDAOKey());
              populatedTemplates.add(template)
            } else {
              newTemplateList.set(template.getDAOKey(), new PermissionTemplateReference[] { template });
            }
          }
        }
        List<String, List> cache = (List<String, List>) permissionTemplateCache.getCache();

      `
    },
    {
      name: 'put_',
      javaCode: `
        refreshPermissionTemplateCache(x, obj);
        return getDelegate().put_(x, obj);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        refreshPermissionTemplateCache(x, obj);
        return getDelegate().remove_(x, obj);
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
        refreshPermissionTemplateCache(x, null);
        return getDelegate().removeAll_(x, skip, limit, order, predicate);
      `
    }
  ]
});
