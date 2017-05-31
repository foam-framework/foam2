/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.test;

import bsh.EvalError;
import bsh.Interpreter;
import foam.core.*;
import foam.dao.*;
import foam.nanos.NanoService;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.Date;
import foam.mlang.MLang.*;
import java.io.IOException;

public class TestRunner
  extends    ContextAwareSupport
  implements NanoService
{

  public void start() {
    final MapDAO tests = (MapDAO) getX().get("TestDAO");
    /* TODO add listener for when test is scheduled
    */
    runAllTests();
  }

  public Test runTest(Test test) {
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

    //TODO: get rid of line: Testing perposes
    System.out.println(test.getOutput());

    test.setScheduled(false);
    // increment lastRun, success, failures
    return test;

  }

  public void runAllTests() {
    final MapDAO tests = (MapDAO) getX().get("TestDAO");
     try {
     final JournaledDAO jTests = new JournaledDAO(tests,"TestFile.jrl");
    ((AbstractDAO) tests.where(foam.mlang.MLang.EQ(Test.SCHEDULED, Boolean.TRUE))).select(new AbstractSink() {
      public void put(FObject o, Detachable sub) {
        Test     test  = (Test) o;
        test = runTest(test);
        jTests.put(test);
      }
    });
    } catch (IOException e){
      e.printStackTrace();
    }
  }

  public static void main(String[] args){
    MapDAO tests = new MapDAO();
    
    X      x     = EmptyX.instance().put("TestDAO", tests);

    tests.setX(x);
    tests.setOf(Test.getOwnClassInfo());
    try {
      JournaledDAO jTests = new JournaledDAO(tests,"TestFile.jrl");
      TestRunner runner = new TestRunner();
      runner.setX(x);
      runner.start();
    } catch (IOException e){
      e.printStackTrace();
    }
    
  }
}
