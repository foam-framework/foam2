package foam.core;

import java.util.ArrayList;

public class CompoundException extends RuntimeException {
  private ArrayList exceptions = new ArrayList<RuntimeException>();

  public void add(Throwable t) {
    exceptions.add(t);
  }

  public void maybeThrow() {
    if ( exceptions.size() != 0 ) {
      throw this;
    }
  }
}
