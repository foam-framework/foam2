package foam.dao;

import foam.dao.*;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.nanos.auth.PublicUserEntity;
import foam.nanos.auth.User;
import net.nanopay.tx.model.Transaction;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.logger.Logger;

/**
 * Populate a model returned from find or select with a small subset of public 
 * user information.
 *
 * Example: A call like
 *
 *   new foam.dao.PublicUserInfoDAO(x, "payerId", "payer", ...)
 *
 * will look for a property named "payerId" on the object being selected and
 * look up the user associated with that id. It will then set the given property
 * ("payer") to the object being returned that contains some public properties
 * of the associated user.
 *
 * Requires both properties to already be defined on the model. For example, on
 * Transaction.js:
 *
 *     ...
 *   },
 *   {
 *    class: 'FObjectProperty',
 *    of: 'net.nanopay.tx.model.TransactionEntity',
 *    name: 'payee',
 *    storageTransient: true
 *   },
 *   {
 *    class: 'Long',
 *    name: 'payeeId'
 *   },
 *   {
 *     ...
 */
public class PublicUserInfoDAO
  extends ProxyDAO
{
  private String idPropertyName_;
  private String propertyNameToSet_;

  public PublicUserInfoDAO(
      X x,
      String idPropertyName,
      String propertyNameToSet,
      DAO delegate
  ) {
    super(x, delegate);
    idPropertyName_ = idPropertyName;
    propertyNameToSet_ = propertyNameToSet;
    userDAO_ = (DAO) x.get("localUserDAO");
    logger_ = (Logger) x.get("logger");
  }

  protected DAO userDAO_;
  protected Logger logger_;

  private class DecoratedSink extends foam.dao.ProxySink {
    public DecoratedSink(X x, Sink delegate) {
      super(x, delegate);
    }

    @Override
    public void put(Object obj, foam.core.Detachable sub) {
      obj = fillEntitiesInfo((FObject) obj);
      getDelegate().put(obj, sub);
    }
  }

  @Override
  public FObject find_(X x, Object id) {
    FObject obj = getDelegate().find_(x, id);
    if ( obj != null ) {
      obj = fillEntitiesInfo(obj);
    }
    return obj;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    Sink decoratedSink = new DecoratedSink(x, sink);
    getDelegate().select_(x, decoratedSink, skip, limit, order, predicate);
    return sink;
  }

  private FObject fillEntitiesInfo(FObject obj) {
    FObject clone = obj.fclone();
    long id = (long) clone.getProperty(idPropertyName_);
    User user = (User) userDAO_.find(id);

    if ( user == null ) {
      clone.setProperty(propertyNameToSet_, null);
    }

    PublicUserEntity entity = new PublicUserEntity(user);
    clone.setProperty(propertyNameToSet_, entity);

    return clone;
  }
}
