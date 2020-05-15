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
    'foam.nanos.ruler.Operations',
    'java.util.Iterator',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.List',
    'java.util.Map',
    'java.util.TreeMap'
  ],

  properties: [
    {
      class: 'Object',
      type: 'foam.mlang.predicate.Predicate',
      documentation: `
        Predicate to test if the object on 'put()' should go through the checker
        flow of the maker/checker process (i.e. ApprovableAwareDAO).

        If absent/null, which is the default, the checker flow is mandatory.`,
      name: 'checkerPredicate',
      transient: true,
      visibility: 'HIDDEN'
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
              { name: 'obj', type: 'FObject' },
              { name: 'operation', type: 'Operations' }
            ],
            body: `
              FObject oldObj = null;
              try {
                oldObj = (obj.getClass()).newInstance();
              } catch ( Exception e ) {
                Logger logger = (Logger) x.get("logger");
                logger.error("Error instantiating : ", obj.getClass().getSimpleName(), e);
              }

              // convert hashmap of the diff to a treemap to avoid inconsistencies
              // in the order when building the hashkey
              Map diffHashmap = oldObj == null ? null : oldObj.diff(obj);
              TreeMap diff = null;
              if ( diffHashmap != null ) {
                diff = new TreeMap<>();
                diff.putAll(diffHashmap);
              }

              StringBuilder hash_sb = new StringBuilder(obj.getClass().getSimpleName());
              if ( operation == Operations.UPDATE && obj instanceof ApprovableAware ) 
                hash_sb.append(String.valueOf(obj.getProperty("id")));

              if ( diff != null ) {
                // remove ids, timestamps and userfeedback
                if ( operation == Operations.CREATE ) diff.remove("id");
                diff.remove("created");
                diff.remove("lastModified");
                diff.remove("userFeedback");

                // convert array properties to list to get consistent hash
                // and create hash
                Iterator it = diff.entrySet().iterator();

                while( it.hasNext() ) {
                  Map.Entry next = (Map.Entry) it.next();
                  Object nextValue = next.getValue();
                  if ( nextValue instanceof Object[] ) {
                    next.setValue(Arrays.asList((Object[]) nextValue));
                  }
                  if ( nextValue instanceof FObject ) {
                    String hashedKey = getApprovableHashKey(x, (FObject) nextValue, operation);
                    if ( hashedKey.toLowerCase().equals(nextValue.getClass().getSimpleName().toLowerCase()) ) continue;
                    next.setValue(hashedKey);
                  }

                  hash_sb.append(":").append(String.valueOf(next.hashCode()));
                }
              }

              String key = ( diff == null || diff.size() == 0 ) && obj instanceof ApprovableAware ? 
                String.valueOf(obj.getProperty("id")) : 
                hash_sb.toString();
              
              return key;
            `
          })
        );
      }
    }
  ]
});
