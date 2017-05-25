/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.test;

import bsh.EvalError;
import bsh.Interpreter;
import foam.core.*;
import foam.core.PropertyInfo;
import foam.dao.AbstractSink;
import foam.dao.MapDAO;
import foam.nanos.NanoService;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.Date;
import foam.mlang.MLang.*;

public class TestRunner
  extends    ContextAwareSupport
  implements NanoService
{

  public void start() {
    final MapDAO tests = (MapDAO) getX().get("TestDAO");
    /* TODO   
     * If the test's schedule flag has changed to true then run that test
     
    tests.listen(
      function listener (newValue, oldValue){
        if(newValue !== oldValue){
      runTest(newValue);
    );
    
    */
    runAllTests();
  }

  public void runTest(Test test) {
    final MapDAO tests = (MapDAO) getX().get("TestDAO");
    ByteArrayOutputStream bas   = new ByteArrayOutputStream();
    PrintStream           ps    = new PrintStream(bas);
    final Interpreter     shell = new Interpreter(); // Creates a new Interpreter at each call

    try {
      shell.set("currentTest", test);
      test.setPassed(0);
      test.setFailed(0);
      test.setOutput("");

      // Sets the shell output to a Stream that will later be redirected to the output parameter
      shell.setOut(ps);

      // creates the testing method
      shell.eval("test(boolean exp, String message) { if ( exp ) { currentTest.setPassed(currentTest.getPassed()+1); } else currentTest.setFailed(currentTest.getFailed()+1); print((exp ? \"SUCCESS: \" : \"FAILURE: \")+message);}");

      shell.eval(test.getCode());
    } catch (EvalError e) {
      e.printStackTrace();
    }

    test.setLastRun(new Date());

    // sets stream to output property
    ps.flush();
    test.setOutput(bas.toString());
    // increment lastRun, success, failures
    tests.put(test);

  }

  public void runAllTests() {
    final MapDAO tests = (MapDAO) getX().get("TestDAO");
    tests.where(EQ(Test.SCHEDULED, true)).select(new AbstractSink() {
      public void put(FObject o, Detachable sub) {
        Test     test  = (Test) o;
        runTest(test);
      }
    });
  }

  public static void main(String[] args){
    MapDAO tests = new MapDAO();
    X      x     = EmptyX.instance().put("TestDAO", tests);

    tests.setX(x);
    tests.setOf(Test.getOwnClassInfo());

    Test test1 = new Test();
    test1.setId("Test 1");
    test1.setCode("test(2==2 ,\"WORKS\");test(1==2 ,\"BROKEN\");print(\"All Done.\");");
    tests.put(test1);

    TestRunner runner = new TestRunner();
    runner.setX(x);
    runner.start();
  }
}
