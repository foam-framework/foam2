package foam.nanos.script;

import java.io.IOException;
import java.io.PrintStream;

import bsh.EvalError;
import bsh.Interpreter;
import foam.core.X;
import foam.nanos.boot.NSpec;
import foam.nanos.logger.Logger;

public class BeanShellExecutor {
  private NSpec nSpec;
  public static final Object[] OBJECT_HOLDER = new Object[1];
  
  public BeanShellExecutor(NSpec nSpec) {
    this.nSpec = nSpec; 
  }

  public Object execute(X x, PrintStream ps, String serviceScript ) throws IOException  {
    Interpreter shell = new Interpreter();
    try {
      shell.set("x", x);
      Object service = shell.eval(serviceScript);
      nSpec.saveService(x, service);
      return service;
    } catch (EvalError e) {
      Logger logger = (Logger) x.get("logger");
      if ( logger != null ) {
        logger.error("NSpec serviceScript error", serviceScript, e);
      } else {
        System.err.println("NSpec serviceScript error: " + serviceScript);
        e.printStackTrace();
      }
      return null;
    }
  }
}