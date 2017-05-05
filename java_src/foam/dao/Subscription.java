package foam.dao;

public class Subscription
  implements foam.core.Detachable
{
  private boolean detached_ = false;

  public Subscription() { }

  public void detach() { detached_ = true; }

  public boolean getDetached() { return detached_; }
}
