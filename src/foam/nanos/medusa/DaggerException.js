/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'DaggerException',
  package: 'foam.nanos.medusa',
  javaExtends: 'foam.core.FOAMException',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public DaggerException(String message) {
    super(message);
  }

  public DaggerException(String message, Throwable cause) {
    super(message, cause);
  } 
          `
        }));
      }
    }
  ]
});
