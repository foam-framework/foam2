foam.CLASS({
  package: 'foam.nanos.script',
  name: 'TestRunnerScript',
  extends: 'foam.nanos.script.Script',

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.test.Test',
    'java.util.*',
    'foam.nanos.logger.LogLevelFilterLogger',
    'foam.util.SafetyUtil'
  ],
  constants: [
    {
      name: 'CHECK_MARK',
      type: 'String',
      value: '\u2713'
    },
    {
      name: 'CROSS_MARK',
      type: 'String',
      value: '\u2718'
    },
    {
      name: 'GREEN_COLOR',
      type: 'String',
      value: '\u001B[32m'
    },
    {
      name: 'RED_COLOR',
      type: 'String',
      value: '\u001B[31m'
    },
    {
      name: 'RESET_COLOR',
      type: 'String',
      value: '\u001B[0m'
    }
  ],
  properties: [
    {
      name: 'failedTests',
      class: 'Int'
    },
    {
      name: 'passedTests',
      class: 'Int'
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
        // turn off logging to get rid of clutter.
        LogLevelFilterLogger loggerFilter = (LogLevelFilterLogger) x.get("logger");
        loggerFilter.setLogInfo(false);
        loggerFilter.setLogDebug(false);
        loggerFilter.setLogWarning(false);

        DAO testDAO = (DAO) x.get("testDAO");
        ArraySink tests = (ArraySink) testDAO.select(new ArraySink());
        List testArray = tests.getArray();

        for ( int i = 0; i < testArray.size(); i ++ ) {
          Test test = (Test) testArray.get(i);
          test = (Test) test.fclone();
          if ( ! test.getEnabled() ) {
            continue;
          }
          if ( test.getServer() ) {
            runServerSideTest(x, test);
          } else {
            // TODO: Run client side tests in a headless browser.
          }
        }

        System.out.println("DONE RUNNING TESTS");

        printBold(GREEN_COLOR + " " +  "PASSED: " + Integer.toString(getPassedTests()) + " " + RESET_COLOR);
        printBold(RED_COLOR + " " + "FAILED: " + Integer.toString(getFailedTests()) + " " + RESET_COLOR);

        // Exit with the appropriate output.
        if ( getFailedTests() > 0 ) {
          System.exit(1);
        }
        System.exit(0);
      `
    },
    {
      name: 'runServerSideTest',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        },
        {
          name: 'test', javaType: 'Test'
        }
      ],
      javaCode: `
        printBold(test.getId());
        try {
          test.runScript(x);
          setPassedTests(getPassedTests() + (int) test.getPassed());
          setFailedTests(getFailedTests() + (int) test.getFailed());
          printOutput(test);
        }
        catch ( Exception e ) {
          e.printStackTrace();
          setFailedTests(getFailedTests() + 1);
        }
      `
    },
    {
      name: 'printBold',
      args: [
        {
          name: 'message', javaType: 'String'
        }
      ],
      javaReturns: 'void',
      javaCode: 'System.out.println("\\033[0;1m" + message + RESET_COLOR);'
    },
    {
      name: 'printOutput',
      args: [
        {
          name: 'test', javaType: 'Test'
        }
      ],
      javaReturns: 'void',
      javaCode: `
        String outputs[] = test.getOutput().split("\\n");
        for( String output: outputs ) {
          if ( output.startsWith("SUCCESS") ) {
            System.out.println("\\t" + GREEN_COLOR + " " + CHECK_MARK + " " + output + " " + RESET_COLOR);
          }
          else if ( output.startsWith("FAILURE") ) {
            System.out.println("\\t" + RED_COLOR + " "+ CROSS_MARK + " " + output + " " + RESET_COLOR);
          }
        }
      `
    }
  ]
});
