/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

public class TestRunner
   // implements NanoService
  implements Runnable, ContextAwareSupport
{

  // public void start()
  public void run() {
    DAO tests = (DAO) getX().get('TestDAO');

    tests.select(new AbstractSink() {
      public void put(FObject o, Detachable sub) {
        Test test = (Test) o;

        // phase 2
        // define assert()
        jshell(test.code);

        // increment lastRun, success, failures
        tests.put(test);
      }
    });
  }

  main()
    DAO tests = new MapDAO();
    Test test1 = new Test();
    test1.name = "Test 1";
    test1.code = "System.out.println(\"I'm working\");";

    tests.put(test1);
    tests.put(test2);
    tests.put(test3);

    X x = EmptyX.instance().put('TestDAO', tests);
    TestRunner runner = new TestRunner();
    setX(x);
    runner.run();
  }

}
