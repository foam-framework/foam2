/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.test;

import foam.core.*;
import foam.dao.*;
import foam.nanos.*;
import bsh.*;
public class TestRunner extends ContextAwareSupport implements NanoService {

  public void start() {
    final MapDAO tests = (MapDAO) getX().get("TestDAO");
    final Interpreter shell = new Interpreter();
    tests.select(new AbstractSink() {
      public void put(FObject o, Detachable sub) {
        Test test = (Test) o;

        // phase 2
        // define assert()
       try{
        shell.eval(test.getCode());
       } catch (EvalError e) {
           e.printStackTrace();
       }
       
        // increment lastRun, success, failures
        tests.put(test); 
      }
    });
  }

 public void main(){
    DAO tests = new MapDAO();
    Test test1 = new Test();
    test1.setName("Test 1");
    test1.setCode("System.out.println(\"I'm working\");");

    tests.put(test1);
    X x = EmptyX.instance().put("TestDAO", tests);
    TestRunner runner = new TestRunner();
    setX(x);
    runner.start();
  }

}
