/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'AlarmIdRefines',
  refines: 'foam.nanos.alarming.AlarmId',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public AlarmId(String name) {
    this(name, System.getProperty("hostname", "localhost"));
  }
          `
        }));
      }
    }
  ]
});
