/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.script',
  name: 'TestRunnerScript',
  extends: 'foam.nanos.script.Script',

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.script.Language',
    'foam.nanos.script.TestRunnerConfig',
    'foam.nanos.test.Test',
    'java.util.*',
    'foam.nanos.logger.LogLevelFilterLogger',
    'foam.nanos.logger.Logger',
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
    },
    {
      name: 'failedTestsList',
      class: 'FObjectArray',
      of: 'Test'
    }
  ],

  methods: [
    {
      name: 'runScript',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      javaCode: `
//        foam.core.XLocator.set(x);

        // turn off logging to get rid of clutter.
        LogLevelFilterLogger loggerFilter = (LogLevelFilterLogger) x.get("logger");
        loggerFilter.setLogDebug(false);
        loggerFilter.setLogInfo(false);
        loggerFilter.setLogWarning(false);

        TestRunnerConfig config = (TestRunnerConfig) x.get("testRunnerConfig");
        String testSuite = config != null ? config.getTestSuite() : null;

        DAO testDAO = (DAO) x.get("testDAO");
        ArraySink tests = testSuite == null ?
          (ArraySink) testDAO.select(new ArraySink()) :
          (ArraySink) testDAO.where(foam.mlang.MLang.EQ(Test.TEST_SUITE, testSuite)).select(new ArraySink());
        List testArray = tests.getArray();

        List<String> selectedTests = null;
        if ( ! SafetyUtil.isEmpty(System.getProperty("foam.tests")) ){
          String t = System.getProperty("foam.tests");
          selectedTests = Arrays.asList(t.split(","));
        }

        for ( int i = 0; i < testArray.size(); i ++ ) {
          Test test = (Test) testArray.get(i);
          test = (Test) test.fclone();
          if ( ! test.getEnabled() ) {
            continue;
          }

          if ( selectedTests != null ) {
            if ( selectedTests.contains(test.getId()) ) {
              runTests(x, test);
            } else {
              continue;
            }
          } else {
            runTests(x, test);
          }
        }

        System.out.println("DONE RUNNING " + testArray.size() + " TESTS");
        System.out.println("TEST SUITE: " + (testSuite == null ? "full" : 
                                             testSuite.isEmpty() ? "main" : 
                                             testSuite));

        printBold(GREEN_COLOR + " " +  "PASSED: " + Integer.toString(getPassedTests()) + " " + RESET_COLOR);
        printBold(RED_COLOR + " " + "FAILED: " + Integer.toString(getFailedTests()) + " " + RESET_COLOR);

        // Exit with the appropriate output.
        if ( getFailedTests() > 0 ) {
          System.out.println(RED_COLOR + " FAILED TESTS: " + RESET_COLOR);
          Test[] failedTests = getFailedTestsList();
          for (Test test: failedTests ) {
            System.out.println(test.getId());
            String outputs[] = test.getOutput().split("\\n");
            for( String output: outputs ) {
              if ( output.startsWith("FAILURE") ) {
                System.out.println("\\t" + RED_COLOR + " "+ CROSS_MARK + " " + output + " " + RESET_COLOR);
              }
            }
          }
          System.exit(1);
        }
        System.exit(0);
      `
    },
    {
      name: 'runTests',
      args: [
        {
          name: 'x', type: 'Context'
        },
        {
          name: 'test', type: 'foam.nanos.test.Test'
        }
      ],
      javaCode: `
        if ( test.getLanguage() == Language.BEANSHELL ||
             test.getLanguage() == Language.JSHELL ) {
          runServerSideTest(x, test);
        } else { 
          // TODO: Run client side tests in a headless browser.
        }
      `
    },
    {
      name: 'runServerSideTest',
      args: [
        {
          name: 'x', type: 'Context'
        },
        {
          name: 'test', type: 'foam.nanos.test.Test'
        }
      ],
      javaCode: `
        printBold(test.getId());
        try {
          test.runScript(x);
          setPassedTests(getPassedTests() + (int) test.getPassed());
          setFailedTests(getFailedTests() + (int) test.getFailed());
          if ( (int) test.getFailed() > 0) {
            addToFailedTestsList(test);
          }
          printOutput(test);
        }
        catch ( Exception e ) {
          Logger logger = (Logger) x.get("logger");
          logger.error(e);
          setFailedTests(getFailedTests() + 1);
          addToFailedTestsList(test);
        }
      `
    },
    {
      name: 'addToFailedTestsList',
      args: [
        {
          name: 'test', javaType: 'Test'
        }
      ],
      javaCode: `
        Test[] failedTests = getFailedTestsList();
        Test[] temp = new Test[failedTests.length+1];
        for ( int i = 0;i < failedTests.length; i++ ) {
          temp[i] = failedTests[i];
        }
        temp[failedTests.length]=test;
        setFailedTestsList(temp);`
    },
    {
      name: 'printBold',
      args: [
        {
          name: 'message', type: 'String'
        }
      ],
      javaCode: 'System.out.println("\\033[0;1m" + message + RESET_COLOR);'
    },
    {
      name: 'printOutput',
      args: [
        {
          name: 'test', type: 'foam.nanos.test.Test'
        }
      ],
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
