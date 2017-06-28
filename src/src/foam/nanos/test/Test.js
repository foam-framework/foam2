/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.test',
  name: 'Test',
  extends: 'foam.nanos.script.Script',

  javaImports: [
    'bsh.EvalError',
    'bsh.Interpreter',
    'java.io.ByteArrayOutputStream',
    'java.io.PrintStream',
    'java.util.Date'
  ],

  properties: [
    {
      class: 'Int',
      name: 'passed'
    },
    {
      class: 'Int',
      name: 'failed'
    }
  ],

  methods: [
    {
      name: 'runScript',
      javaReturns: 'void',
      javaCode:
`ByteArrayOutputStream baos = new ByteArrayOutputStream();
PrintStream ps = new PrintStream(baos);
Interpreter shell = new Interpreter();

try {
  shell.set("currentTest", this);
  setPassed(0);
  setFailed(0);
  setOutput("");
  shell.setOut(ps);

  // creates the testing method
  shell.eval("test(boolean exp, String message) { if ( exp ) { currentTest.setPassed(currentTest.getPassed()+1); } else currentTest.setFailed(currentTest.getFailed()+1); print((exp ? \\"SUCCESS: \\" : \\"FAILURE: \\")+message);}");
  shell.eval(getCode());
} catch (EvalError e) {
  e.printStackTrace();
}
setLastRun(new Date());
ps.flush();
setOutput(baos.toString());
setScheduled(false);`
    }
  ]
});
