package foam.dao;

public class SlowDAO
  extends ProxyDAO
{
  private int delayms_ = 500;

  public SlowDAO(DAO delegate) {
    super();
    setDelegate(delegate);
  }

  public SlowDAO(int delayms, DAO delegate) {
    this(delegate);
    delayms_ = delayms;
  }

  @Override
  public foam.core.FObject put_(foam.core.X x, foam.core.FObject obj) {
    try {
      Thread.sleep(delayms_);
    } catch(InterruptedException e) {
    }

    return super.put_(x, obj);
  }

  @Override
  public foam.core.FObject remove_(foam.core.X x, foam.core.FObject obj) {
    try {
      Thread.sleep(delayms_);
    } catch(InterruptedException e) {
    }

    return super.remove_(x, obj);
  }

  @Override
  public foam.dao.Sink select_(foam.core.X x, foam.dao.Sink sink, long skip, long limit, foam.mlang.order.Comparator order, foam.mlang.predicate.Predicate predicate) {
    try {
      Thread.sleep(delayms_);
    } catch(InterruptedException e) {
    }

    return super.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public void removeAll_(foam.core.X x, long skip, long limit, foam.mlang.order.Comparator order, foam.mlang.predicate.Predicate predicate) {
    try {
      Thread.sleep(delayms_);
    } catch(InterruptedException e) {
    }

    super.removeAll_(x, skip, limit, order, predicate);
  }
}
