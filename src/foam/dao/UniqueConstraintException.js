/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'UniqueConstraintException',
  package: 'foam.dao',
  javaExtends: 'RuntimeException',
  implements: ['foam.core.Exception'],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public UniqueConstraintException(String message) {
    super(message);
  }

  public UniqueConstraintException(String message, Throwable cause) {
    super(message, cause);
  }
          `
        }));
      }
    }
  ]
});
