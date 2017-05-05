package foam.core;

public class ContextAwareSupport
  implements ContextAware
{
  private X x_;

  public X    getX() { return x_; }
  public void setX(X x) { x_ = x; }
}
