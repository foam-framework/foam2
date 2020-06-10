package foam.core;

public class Freezer {

  boolean __freeze__ = false;

  boolean isFrozen() {
    return __freeze__;
  }

  void freeze() {
    __freeze__ = true;
  }

}
