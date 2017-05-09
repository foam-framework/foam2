
public class TestRunner
   // implements NanoService
  implements Runnable, ContextAwareSupport
{

  // public void start()
  public void run() {
    DAO tests = (DAO) getX().get('TestDAO');

    tests.select(new AbstractSink() {
      public void put(Detachable sub, FObject o) {
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
