package foam.dao;

import foam.core.FObject;
import foam.core.X;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.pm.PM;

/**
 * Created by nick on 19/05/17.
 */
public class PMDAO extends ProxyDAO {

  @Override
  public FObject put_(X x, FObject obj) {
    PM pm = new PM(PMDAO.class, obj.getClassInfo().getId() + ":put");
    try {
      super.put_(x, obj);
    } catch(Exception e) {
      e.printStackTrace();
    } finally {
      pm.log(getX());
    }
    return obj;
  }

  @Override
  public FObject find_(X x,Object id) {
    PM pm;
    if (id instanceof FObject) {
      FObject obj = (FObject)id;
      pm = new PM(PMDAO.class, obj.getClassInfo().getId() + ":find");
    } else {
      pm = new PM(PMDAO.class, id.getClass().getName() + ":find");
    }
    FObject fobj = null;
    try {
      fobj = super.find_(x, id);
    } catch(Exception e) {
      e.printStackTrace();
    } finally {
      pm.log(getX());
    }
    return fobj;
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    PM pm = new PM(PMDAO.class, obj.getClassInfo().getId() + ":remove");
    try {
      super.remove_(x, obj);
    } catch (Exception e) {
      e.printStackTrace();
    } finally {
      pm.log(getX());
    }
    return obj;
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    // Is this the right key to use?
    PM pm = new PM(PMDAO.class, getOwnClassInfo().getId() + ":removeAll");
    try {
      super.removeAll_(x, skip, limit, order, predicate);
    } catch (Exception e) {
      e.printStackTrace();
    } finally {
      pm.log(getX());
    }
  }
}
