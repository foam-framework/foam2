package foam.nanos.tomcat;

import foam.core.X;

public class ContextLocator {
  protected static X x;

  public static X getX() {
    return x;
  }

  public static void setX(X x) {
    ContextLocator.x = x;
  }
}
