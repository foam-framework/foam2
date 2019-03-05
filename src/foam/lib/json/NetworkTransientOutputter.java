package foam.lib.json;

import foam.lib.*;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;

public class NetworkTransientOutputter
  extends Outputter {

  public NetworkTransientOutputter(foam.core.X x) {
    this(x, (PrintWriter) null);
  }

  public NetworkTransientOutputter(foam.core.X x, File file) throws FileNotFoundException {
    this(x, new PrintWriter(file));
  }

  public NetworkTransientOutputter(foam.core.X x, PrintWriter writer) {
    super(x, writer);
    propertyPredicate_ = new NetworkPropertyPredicate();
  }

}
