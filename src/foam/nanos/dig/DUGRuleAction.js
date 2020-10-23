/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DUGRuleAction',

  documentation: 'Rule action for DUG',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.HTTPSink'
  ],


  properties: [
    {
      class: 'URL',
      name: 'url'
    },
    {
      class: 'String',
      name: 'bearerToken'
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.http.Format',
      name: 'format'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            HTTPSink sink = new HTTPSink(
              getUrl(), 
              getBearerToken(), 
              getFormat(),
              new foam.lib.AndPropertyPredicate(x, 
                new foam.lib.PropertyPredicate[] {
                  new foam.lib.ExternalPropertyPredicate(),
                  new foam.lib.NetworkPropertyPredicate(), 
                  new foam.lib.PermissionedPropertyPredicate()}),
              true);
              
              sink.setX(x);
              sink.put(obj, null);
          }
        }, "DUG Rule (url: " + getUrl() + " )");
      `
    }
  ]
});
