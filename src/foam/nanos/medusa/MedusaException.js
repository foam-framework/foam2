/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'MedusaException',
  package: 'foam.nanos.medusa',
  javaExtends: 'foam.core.FOAMException',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public MedusaException(String message) {
    super(message);
  }

  public MedusaException(String message, Throwable cause) {
    super(message, cause);
  }
          `
        }));
      }
    }
  ]
});
