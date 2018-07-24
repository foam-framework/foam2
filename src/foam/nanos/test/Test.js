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
    'id', 'enabled', 'description', 'server',
    'passed', 'failed', 'lastRun', 'lastDuration',
    'status', 'run'
  ],

  searchColumns: ['id', 'description'],

  documentation: `
    A scriptable Unit Test.
    Tests can be run on either the server in BeanShell or on the client in Javascript.
    Call test(boolean exp, String message) for each test, where 'exp' evaluates to
    true if the test passed and false if it failed.
  `,

  properties: [
    {
      class: 'Long',
      name: 'passed',
      visibility: foam.u2.Visibility.RO,
      tableCellFormatter: function(value) {
        if ( value ) this.start().style({ color: '#0f0' }).add(value).end();
      }
    },
    {
      class: 'Long',
      name: 'failed',
      visibility: foam.u2.Visibility.RO,
      tableCellFormatter: function(value) {
        if ( value ) this.start().style({ color: '#f00' }).add(value).end();
      }
    }
  ],

  methods: [
    {
      /** Template method used to add additional code in subclasses. */
      name: 'runTest',
      code: function(x) {
        return eval(this.code);
      },
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        }
      ],
      javaReturns: 'void',
      javaCode: '/* NOOP */'
    },
    {
      name: 'test',
      args: [
        {
          name: 'exp', javaType: 'boolean'
        },
        {
          name: 'message', javaType: 'String'
        }
      ],
      javaReturns: 'void',
      javaCode: `
        if ( exp ) {
          setPassed(getPassed()+1);
        } else {
          setFailed(getFailed()+1);
        }
        print((exp ? "SUCCESS: " : "FAILURE: ") + message);
      `
    },
    {
      name: 'print',
      args: [
        {
          name: 'message', javaType: 'String'
        }
      ],
      javaReturns: 'void',
      javaCode: `
        setOutput(getOutput() + "\\n" + message);
      `
    },
    {
      name: 'runScript',
      code: function() {
        var ret;
        var startTime = Date.now();

        try {
          this.passed = 0;
          this.failed = 0;
          this.output = '';
          var log = function() {
            this.output += Array.from(arguments).join('') + '\n';
          }.bind(this);
          var test = (condition, message) => {
            if ( condition ) {
              this.passed += 1;
            } else {
              this.failed += 1;
            }
            this.output += ( condition ? 'SUCCESS: ' : 'FAILURE: ' ) +
                message + '\n';
          };
          with ( { log: log, print: log, x: self.__context__, test: test } )
            ret = Promise.resolve(eval(this.code));
        } catch (err) {
          this.failed += 1;
          this.output += err;
        }

        ret.then(() => {
          var endTime = Date.now();
          var duration = endTime - startTime; // Unit: milliseconds
          this.lastRun = new Date();
          this.lastDuration = duration;
          this.scriptDAO.put(this);
        });

        return ret;
      },
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        }
      ],
      javaReturns: 'void',
      javaCode: `
        ByteArrayOutputStream baos  = new ByteArrayOutputStream();
        PrintStream           ps    = new PrintStream(baos);
        Interpreter           shell = createInterpreter(x);
        PM                    pm    = new PM(this.getClass(), getId());

        try {
          setPassed(0);
          setFailed(0);
          setOutput("");
          shell.setOut(ps);

          // creates the testing method
          shell.eval("test(boolean exp, String message) { if ( exp ) { currentScript.setPassed(currentScript.getPassed()+1); } else { currentScript.setFailed(currentScript.getFailed()+1); } print((exp ? \\"SUCCESS: \\" : \\"FAILURE: \\")+message);}");
          shell.eval(getCode());
          runTest(x);
        } catch (Throwable e) {
          setFailed(getFailed()+1);
          ps.println();
          e.printStackTrace(ps);
          e.printStackTrace();
        } finally {
          pm.log(x);
        }

        setLastRun(new Date());
        setLastDuration(pm.getTime());
        ps.flush();
        setOutput(baos.toString() + getOutput());
    `
    }
  ]
});
