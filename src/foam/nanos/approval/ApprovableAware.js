/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.INTERFACE({
  package: 'foam.nanos.approval',
  name: 'ApprovableAware',
  implements: [
    'foam.comics.v2.userfeedback.UserFeedbackAware',
    'foam.core.ContextAware',
    'foam.nanos.auth.LifecycleAware',
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.nanos.logger.Logger',
    'foam.nanos.approval.ApprovableAware',
    'java.util.Iterator',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.List',
    'java.util.Map',
  ],

  methods: [
    {
      name: 'getStringId',
      type: 'String'
    }  
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.methods.push(
          foam.java.Method.create({
            name: 'getApprovableHashKey',
            type: 'String',
            static: true,
            visibility: 'public',
            args: [
              { name: 'x', type: 'X' },
              { name: 'obj', type: 'FObject' }
            ],
            body: `
              FObject oldObj = null;
              try {
                oldObj = (obj.getClass()).newInstance();
              } catch ( Exception e ) {
                Logger logger = (Logger) x.get("logger");
                logger.error("Error instantiating : ", obj.getClass().getSimpleName(), e);
              }
              Map diff = oldObj == null ? null : oldObj.diff(obj);
              if ( diff != null ) {
                // remove ids, timestamps and userfeedback
                diff.remove("id");
                diff.remove("created");
                diff.remove("lastModified");
                diff.remove("userFeedback");
                // convert array properties to list to get consistent hash
                Iterator it = diff.entrySet().iterator();
                List<String> arrayProps = new ArrayList<String>();
                while( it.hasNext() ) {
                  Map.Entry next = (Map.Entry) it.next();
                  if ( next.getValue() instanceof Object[] ) {
                    arrayProps.add((String) next.getKey());
                  }
                }
                for ( String prop : arrayProps ) {
                  diff.put(prop, Arrays.asList((Object[]) diff.get(prop)).hashCode());
                }
              }

              String key = diff == null || diff.size() == 0 ? ((ApprovableAware) obj).getStringId() : obj.getClass().getSimpleName() + String.valueOf(diff.hashCode());
              return key;
            `
          })
        );
      }
    }
  ]
});
