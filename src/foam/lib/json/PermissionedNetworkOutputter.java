package foam.lib.json;

import foam.lib.*;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.PrintWriter;

public class PermissionedNetworkOutputter
  extends Outputter {

  public PermissionedNetworkOutputter(foam.core.X x) {
    this(x, (PrintWriter) null);
  }

  public PermissionedNetworkOutputter(foam.core.X x, File file) throws FileNotFoundException {
    this(x, new PrintWriter(file));
  }

  public PermissionedNetworkOutputter(foam.core.X x, PrintWriter writer) {
    super(x, writer);
    propertyPredicate_ = new AndPropertyPredicate(x, new PropertyPredicate[] {new NetworkPropertyPredicate(), new PermissionedPropertyPredicate()});
  }

}
