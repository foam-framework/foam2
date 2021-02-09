/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.i18n',
  name: 'LocaleServiceProviderSink',
  extends: 'foam.dao.ArraySink',

  documentation: 'For same match translations, entry with spid trumps without.',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.Sink',
    'java.util.HashSet',
    'java.util.Set',
    'java.util.stream.Collectors'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public LocaleServiceProviderSink(X x) {
    super(x);
  }
         `
        }));
      }
    }
  ],

  properties: [
    {
      name: 'entries',
      class: 'Set',
      javaFactory: 'return new HashSet();'
    }
  ],

  methods: [
    {
      name: 'put',
      args: [
        {
          name: 'obj',
          type: 'Object'
        },
        {
          name: 'sub',
          type: 'foam.core.Detachable'
        }
      ],
      javaCode: `
      Locale locale = (Locale) obj;
      Locale existing = (Locale) getEntries().get(locale.getId());
      if ( existing == null ||
           SafetyUtil.isEmpty(exising.getSpid()) ) {
        getEntries().put(locale);
      }
      `
    },
    {
      name: 'array',
      class: 'List',
      javaCode: `
      return getEntries().stream().collect(Collectors.toList());
      `
    }
  ]
});
