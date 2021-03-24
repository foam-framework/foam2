/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.test',
  name: 'Test',
  extends: 'foam.nanos.script.Script',

  imports: [
    'testDAO',
    'testEventDAO'
  ],

  javaImports: [
    'bsh.Interpreter',
    'foam.nanos.app.AppConfig',
    'foam.nanos.app.Mode',
    'foam.nanos.logger.Logger',
    'foam.nanos.pm.PM',
    'foam.nanos.script.*',
    'java.io.ByteArrayOutputStream',
    'java.io.PrintStream',
    'java.util.Date',
    'jdk.jshell.JShell'
  ],

  tableColumns: [
    'id',
    'enabled',
    'server',
    'passed',
    'failed',
    'lastDuration',
    'lastRun',
    'run'
  ],

  searchColumns: [
    'id',
    'description',
    'server'
  ],

  documentation: `
    A scriptable Unit Test.
    Tests can be run on either the server in BeanShell or on the client in Javascript.
    Call test(boolean exp, String message) for each test, where 'exp' evaluates to
    true if the test passed and false if it failed.
  `,

  properties: [
    'id',
    'enabled',
    {
      class: 'String',
      name: 'testSuite'
    },
    {
      class: 'String',
      name: 'daoKey',
      value: 'testDAO'
    },
    {
      class: 'Long',
      name: 'passed',
      visibility: 'RO',
      tableCellFormatter: function(value) {
        if ( value ) this.start().style({ color: '#0f0' }).add(value).end();
      },
      tableWidth: 85
    },
    {
      class: 'Long',
      name: 'failed',
      visibility: 'RO',
      tableCellFormatter: function(value) {
        if ( value ) this.start().style({ color: '#f00' }).add(value).end();
      },
      tableWidth: 85
    },
    {
      class: 'String',
      name: 'eventDaoKey',
      value: 'testEventDAO'
    }
  ],

  methods: [
    {
      /** Template method used to add additional code in subclasses. */
      name: 'runTest',
      type: 'Void',
      javaThrows: ['Throwable'],
      code: function(x) {
        return eval(this.code);
      },
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: '/* NOOP */'
    },
    {
      name: 'test',
      type: 'Void',
      args: [
        {
          name: 'exp', type: 'Boolean'
        },
        {
          name: 'message', type: 'String'
        }
      ],
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
      type: 'Void',
      args: [
        {
          name: 'message', type: 'String'
        }
      ],
      javaCode: `
        setOutput(getOutput() + "\\n" + message);
      `
    },
    {
      name: 'runScript',
      code: function() {
        var startTime = Date.now();

        return new Promise((resolve, reject) => {
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

            var updateStats = () => {
              var endTime = Date.now();
              var duration = endTime - startTime; // Unit: milliseconds
              this.lastRun = new Date();
              this.lastDuration = duration;
            };

            with ( { log: log, print: log, x: this.__context__, test: test } ) {
              Promise.resolve(eval(this.code)).then(() => {
                updateStats();
                resolve();
              }, (err) => {
                updateStats();
                this.failed += 1;
                reject(err);
              });
            }
          } catch (err) {
            updateStats();
            this.failed += 1;
            reject(err);
          }
        });
      },
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      javaCode: `
        // disable tests in production
        if ( ((AppConfig) x.get("appConfig")).getMode() == Mode.PRODUCTION ) {
          return;
        }

        ByteArrayOutputStream baos  = new ByteArrayOutputStream();
        PrintStream           ps    = new PrintStream(baos);
        PM                    pm    = new PM(this.getClass(), getId());
        Language              l     = getLanguage();

        setPassed(0);
        setFailed(0);
        try {
          if ( l == foam.nanos.script.Language.BEANSHELL ) {
            Interpreter shell = (Interpreter) createInterpreter(x, null);
            setOutput("");
            shell.setOut(ps);
            shell.eval("test(boolean exp, String message) { if ( exp ) { currentScript.setPassed(currentScript.getPassed()+1); } else { currentScript.setFailed(currentScript.getFailed()+1); } print((exp ? \\"SUCCESS: \\" : \\"FAILURE: \\")+message);}");
            shell.eval(getCode());
          } else if ( l == foam.nanos.script.Language.JSHELL ) {
            String print = null;
            JShell jShell = (JShell) createInterpreter(x, ps);
            print = new JShellExecutor().execute(x, jShell, getCode());
            ps.print(print);
          } else {
            throw new RuntimeException("Script language not supported");
          }
          runTest(x);
        } catch (Throwable t) {
          setFailed(getFailed() + 1);
          ps.println("FAILURE: " + t.getMessage());
          t.printStackTrace(ps);
          Logger logger = (Logger) x.get("logger");
          logger.error(this.getClass().getSimpleName(), "runTest", getId(), t);
          pm.error(x, t);
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
