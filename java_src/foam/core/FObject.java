package foam.core;

public abstract class FObject {
  public abstract ClassInfo getClassInfo();

  private X x_;
  public X getX() { return x_; }
  public FObject(X x) {
    x_ = x;
  }
}
