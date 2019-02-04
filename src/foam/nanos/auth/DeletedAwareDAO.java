package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.*;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

public class DeletedAwareDAO extends ProxyDAO {

  private String name_;

  private class DeletedAwareSink extends ProxySink {

    public DeletedAwareSink(X x, Sink delegate) {
      super(x, delegate);
    }

    @Override
    public void put(Object obj, foam.core.Detachable sub) {

      if ( canReadDeleted(getX(), (FObject) obj) ) {
        getDelegate().put(obj, sub);
      }
    }
  }


  public DeletedAwareDAO(X x, String name,  DAO delegate) {
    super(x, delegate);
    name_ = name;
  }

  @Override
  public FObject find_(X x, Object id) {

    FObject obj = getDelegate().find_(x, id);
    if ( canReadDeleted(x, obj) ) {
      return obj;
    }

    return null;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    Sink deletedAwareSink = new DeletedAwareSink(x, sink);
    getDelegate().select_(x, deletedAwareSink, skip, limit, order, predicate);

    return sink;
  }

  @Override
  public FObject remove_(X x, FObject obj) {

    if ( obj instanceof DeletedAware ) {
      ((DeletedAware) obj).setDeleted(true);
      obj = getDelegate().put_(x, obj);
    }

    return obj;
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    getDelegate().select_(x, new RemoveSink(x, this), skip, limit, order, predicate);
  }

  private boolean canReadDeleted(X x, FObject obj) {
     String deletePermission = name_ + ".read.deleted";

     if( obj instanceof DeletedAware
       && ((DeletedAware) obj).getDeleted() ) {
       AuthService authService = (AuthService) getX().get("auth");
       return authService.check(x, deletePermission);
     }

     return true;
  }
}
