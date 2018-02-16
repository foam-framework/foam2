package foam.dao;

public class UnreliableDAO
  extends ProxyDAO
{
  private double errorRate_ = 0.5;

  public UnreliableDAO(DAO delegate) {
    super();
    setDelegate(delegate);
  }

  public UnreliableDAO(double errorRate, DAO delegate) {
    this(delegate);
    errorRate_ = errorRate;
  }

  @Override
  public foam.core.FObject put_(foam.core.X x, foam.core.FObject obj) {
    if ( Math.random() < errorRate_ ) {
      throw new RuntimeException("UnreliableDAO decided you are unlucky.");
    }

    return super.put_(x, obj);
  }

  @Override
  public foam.core.FObject remove_(foam.core.X x, foam.core.FObject obj) {
    if ( Math.random() < errorRate_ ) {
      throw new RuntimeException("UnreliableDAO decided you are unlucky.");
    }

    return super.remove_(x, obj);
  }

  @Override
  public foam.dao.Sink select_(foam.core.X x, foam.dao.Sink sink, long skip, long limit, foam.mlang.order.Comparator order, foam.mlang.predicate.Predicate predicate) {
    if ( Math.random() < errorRate_ ) {
      throw new RuntimeException("UnreliableDAO decided you are unlucky.");
    }

    return super.select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public void removeAll_(foam.core.X x, long skip, long limit, foam.mlang.order.Comparator order, foam.mlang.predicate.Predicate predicate) {
    if ( Math.random() < errorRate_ ) {
      throw new RuntimeException("UnreliableDAO decided you are unlucky.");
    }

    super.removeAll_(x, skip, limit, order, predicate);
  }
}
