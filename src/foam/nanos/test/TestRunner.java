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
import foam.mlang.MLang.*;
import foam.nanos.NanoService;
import foam.nanos.script.ScriptStatus;
import foam.nanos.test.Test;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.util.Date;

public class TestRunner
  extends    ContextAwareSupport
  implements NanoService
{

  public void start() {
    final DAO tests = (DAO) getX().get("TestDAO");
    /* TODO add listener for when test is scheduled
    */
    runAllTests();
  }

  public void runAllTests() {
    final DAO tests = (DAO) getX().get("TestDAO");
    try {
      final JDAO jTests = new JDAO(getX(), tests,"TestFile.jrl");
      tests.where(foam.mlang.MLang.EQ(Test.STATUS, ScriptStatus.SCHEDULED)).select(new AbstractSink() {
        @Override
        public void put(Object obj, Detachable sub) {
          ((Test) obj).runScript(getX());
          jTests.put((Test)obj);
        }
      });
    } catch (java.lang.Exception e){
      e.printStackTrace();
    }
  }

  public static void main(String[] args){
    MapDAO tests = new MapDAO();
    X      x     = EmptyX.instance().
      put("TestDAO", tests).
      put(foam.nanos.fs.Storage.class,
          new foam.nanos.fs.Storage());

    tests.setX(x);
    tests.setOf(Test.getOwnClassInfo());
    try {
      JDAO jTests = new JDAO(x, tests,"TestFile.jrl");
      Test test1 = new Test();
      test1.setId("Test 1");
      test1.setCode("test(2==2 ,\"TRUE\");");
      jTests.put(test1);
      Test test2 = new Test();
      test2.setId("Test 2");
      test2.setCode("test(1==2 ,\"FALSE\");");
      test2.setStatus(ScriptStatus.SCHEDULED);
      jTests.put(test2);
      Test test3 = new Test();
      test3.setId("Test 3");
      test3.setCode("print(\"All Done.\");");
      jTests.put(test3);
      TestRunner runner = new TestRunner();
      runner.setX(x);
      runner.start();
    } catch (java.lang.Exception e){
      e.printStackTrace();
    }
  }
}
