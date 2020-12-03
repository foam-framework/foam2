/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.script;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintStream;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import foam.core.X;
import foam.nanos.logger.Logger;
import foam.nanos.script.jShell.EvalInstruction;
import foam.nanos.script.jShell.InstructionPresentation;
import jdk.jshell.JShell;
import jdk.jshell.execution.DirectExecutionControl;
import jdk.jshell.spi.ExecutionControl;
import jdk.jshell.spi.ExecutionControlProvider;
import jdk.jshell.spi.ExecutionEnv;

public class JShellExecutor {
  public static final Object[] X_HOLDER = new X[1];
  public static final Object[] OBJECT_HOLDER = new Object[1];
  
  public Object runExecutor(X x, PrintStream ps, String serviceScript ) throws IOException  {

    JShell jShell = createJShell(ps);

    foam.nanos.script.Script.X_HOLDER[0] = x;
    String init = "import foam.core.X; import foam.nanos.boot.NSpec; X x = foam.nanos.script.Script.X_HOLDER[0]; ";

    execute(x, jShell, init + serviceScript);
    // saveService(x, service)//TODO delete this method.
    jShell.eval("foam.nanos.boot.NSpec.OBJECT_HOLDER[0] = service;");
    return OBJECT_HOLDER[0];
  }

  public String execute(X x, JShell jShell, String script) throws IOException {
    BufferedReader rdr = new BufferedReader(new StringReader(script));
    List<String> l1 = new ArrayList<String>();

    for ( String line = rdr.readLine() ; line != null ; line = rdr.readLine() ) {
      l1.add(line);
    }

    List<String> instructionList = new InstructionPresentation(jShell).parseToInstruction(l1);
    EvalInstruction console = new EvalInstruction(jShell, instructionList, x);
    String print = null;
    try {
      print = console.runEvalInstruction();
    } catch (Exception e) {
      e.printStackTrace();
      Logger logger = (Logger) x.get("logger");
      logger.error(e);
    }
    return print;
  }

  public JShell createJShell(PrintStream ps) {
    JShell jShell = JShell.
      builder().
      out(ps).
      executionEngine(new ExecutionControlProvider() {
        @Override
        public String name() {
          return "direct";
        }

        @Override
        public ExecutionControl generate(ExecutionEnv ee, Map<String, String> map) throws Throwable {
          return new DirectExecutionControl();
        }
      }, null).build();
    return jShell;
  }
}
