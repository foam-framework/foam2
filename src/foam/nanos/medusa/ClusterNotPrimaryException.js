/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'ClusterNotPrimaryException',
  package: 'foam.nanos.medusa',
  javaExtends: 'foam.nanos.medusa.ClusterException',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public ClusterNotPrimaryException(String message) {
    super(message);
  }

  public ClusterNotPrimaryException(String message, Throwable cause) {
    super(message, cause);
  } 
          `
        }));
      }
    }
  ]
});
