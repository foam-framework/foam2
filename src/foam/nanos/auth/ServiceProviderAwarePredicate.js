/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ServiceProviderAwarePredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',

  implements: [
    'foam.core.ContextAware'
  ],

  javaImports: [
    'foam.core.PropertyInfo',
    'java.util.Map',
    'java.util.Map.Entry',
    'java.util.HashMap',
    'java.util.stream.Collectors'
  ],

  properties: [
    {
      name: 'delegate',
      class: 'foam.mlang.predicate.PredicateProperty',
    },
    {
      documentation: 'See ServiceProviderAwareDAO',
      name: 'propertyInfos',
      class: 'Map'
    }
  ],

  methods: [
    {
      name: 'f',
      type: 'Boolean',
      args: [
        {
          name: 'obj',
          type: 'Any'
        }
      ],
      javaCode: `
    if ( new ServiceProviderAwareSupport(getX()).match(getX(), getPropertyInfos(), obj) ) {
      if ( getDelegate() != null ) {
        return getDelegate().f(obj);
      }
      return true;
    }
    return false;
      `
    },
    {
      // TODO/REVIEW - Temporary fix - 'Map' requires deepClone support.
      name: 'deepClone',
      type: 'foam.core.FObject',
      javaCode: `
    ServiceProviderAwarePredicate copy = (ServiceProviderAwarePredicate) super.deepClone();
    copy.setX(getX());
    if ( propertyInfos_ != null ) {
      java.util.Set<Map.Entry<String, PropertyInfo[]>> entries = propertyInfos_.entrySet();
      copy.setPropertyInfos((Map<String, PropertyInfo[]>) entries.stream().collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue)));
    }
    return copy;
`
    }
  ]
});
