package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.*;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

/**
  DAO decorator that sets deleted property when an object
  is removing and filters out deleted=true objects based on permission.

  DeletedAwareDAO marks object as deleted instead of actually removing
  the object from DAO then returns thus it should be placed at the end
  of the decorator stack before MDAO so that it wouldn't cut-off other
  decorators that also override "remove_" and "removeAll_".

  For filtering, objects with deleted=true will be filtered out unless
  the user group has {name}.read.deleted permission where {name} is either
  the lowercase name of the model of the objects by default
  or the {name} provided by the user.
**/



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


  public DeletedAwareDAO(X x, String name, DAO delegate) {
    super(x, delegate);
    name_ = name;
  }

  public DeletedAwareDAO(X x, DAO delegate) {
    super(x, delegate);
    name_ = getOf().getObjClass().getSimpleName().toLowerCase();
  }

  @Override
  public FObject find_(X x, Object id) {

    FObject obj = getDelegate().find_(x, id);
    if ( obj != null && canReadDeleted(x, obj) ) {
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
      DeletedAware clone = (DeletedAware) obj.fclone();
      clone.setDeleted(true);
      obj = getDelegate().put_(x, (FObject) clone);
    } else {
      obj = getDelegate().remove_(x, obj); // can remove a non deleted Aware Obj
    }
    return obj;
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    getDelegate().select_(x, new RemoveSink(x, this), skip, limit, order, predicate);
  }

  public boolean canReadDeleted(X x, FObject obj) {
    String deletePermission =  name_ + ".read.deleted";

    if ( obj instanceof DeletedAware
      && ((DeletedAware) obj).getDeleted() ) {
      AuthService authService = (AuthService) getX().get("auth");
      return authService.check(x, deletePermission);
    }

    return true;
  }
}
