/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.test',
  name: 'Test',
  extends: 'foam.nanos.script.Script',

  imports: [ 'testDAO as scriptDAO' ],

  javaImports: [
    'bsh.EvalError',
    'bsh.Interpreter',
    'foam.nanos.pm.PM',
    'java.io.ByteArrayOutputStream',
    'java.io.PrintStream',
    'java.util.Date'
  ],

  tableColumns: [
    'id', 'enabled', 'description', 'passed', 'failed', 'lastRun', 'run'
  ],

  searchColumns: [ ],

  properties: [
    'id',
    {
      class: 'Int',
      name: 'passed',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Int',
      name: 'failed',
      visibility: foam.u2.Visibility.RO
    }
  ],

  methods: [
    {
      name: 'runScript',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        }
      ],
      javaReturns: 'void',
      javaCode: `
        ByteArrayOutputStream baos  = new ByteArrayOutputStream();
        PrintStream           ps    = new PrintStream(baos);
        Interpreter           shell = new Interpreter();
        PM                    pm    = new PM(this.getClass(), getId());

System.err.println("************************** Test: " + getCode());
        try {
          shell.set("currentTest", this);
          setPassed(0);
          setFailed(0);
          setOutput("");
          shell.set("x", getX());
          shell.setOut(ps);

          // creates the testing method
          shell.eval("test(boolean exp, String message) { if ( exp ) { currentTest.setPassed(currentTest.getPassed()+1); } else { currentTest.setFailed(currentTest.getFailed()+1); } print((exp ? \\"SUCCESS: \\" : \\"FAILURE: \\")+message);}");
          shell.eval(getCode());
        } catch (EvalError e) {
          e.printStackTrace();
        } finally {
          pm.log(x);
        }

        setLastRun(new Date());
        ps.flush();
        System.err.println("******************** Output: " + this.getPassed() + " " + this.getFailed() + " " + baos.toString());
        setOutput(baos.toString());
    `
    }
  ]
});
