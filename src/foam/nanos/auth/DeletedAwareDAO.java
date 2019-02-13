package foam.nanos.auth;

import foam.core.FObject;
import foam.core.X;
import foam.dao.*;
import foam.mlang.MLang;
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

  private String deletePermission_;

  public DeletedAwareDAO(X x, String name, DAO delegate) {
    super(x, delegate);
    deletePermission_ = name + ".read.deleted";
  }

  public DeletedAwareDAO(X x, DAO delegate) {
    super(x, delegate);
    String name = getOf().getObjClass().getSimpleName().toLowerCase();
    deletePermission_ = name + ".read.deleted";
  }

  @Override
  public FObject find_(X x, Object id) {

    DeletedAware obj = (DeletedAware) getDelegate().find_(x, id);

    if ( obj == null || ( obj.getDeleted() && ! canReadDeleted(x) ) ) {
      return null;
    }

    return (FObject) obj;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( canReadDeleted(x) ) {
      return getDelegate().select_(x, sink, skip, limit, order, predicate);
    }

    return getDelegate()
      .where(
        MLang.EQ(
          getOf().getAxiomByName("deleted"), false
        )
      ).select_(x, sink, skip, limit, order, predicate);

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

  public boolean canReadDeleted(X x) {
    AuthService authService = (AuthService) getX().get("auth");
    return authService.check(x, deletePermission_);
  }
}
