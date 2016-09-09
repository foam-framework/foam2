package foam.dao;

import foam.core.*;
import java.util.*;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

public class MapDAO extends AbstractDAO {
  private Map<Object, FObject> data_ = null;

  private Map<Object, FObject> getData() {
    if ( data_ == null ) {
      data_ = (HashMap<Object, FObject>)getX().create(HashMap.class);
    }
    return data_;
  }

  public void setData(Map<Object, FObject> data) {
    data_ = data;
  }

  private ClassInfo of_ = null;
  private PropertyInfo primaryKey_ = null;

  public ClassInfo getOf() {
    return of_;
  }
  public MapDAO setOf(ClassInfo of) {
    of_ = of;
    primaryKey_ = (PropertyInfo)of.getAxiomByName("id");
    return this;
  }
  public PropertyInfo getPrimaryKey() {
    return primaryKey_;
  }


  public FObject put(FObject obj) {
    getData().put(getPrimaryKey().get(obj), obj);

    return obj;
  }

  public FObject remove(FObject obj) {
    getData().remove(getPrimaryKey().get(obj));
    return obj;
  }

  public FObject find(Object id) {
    FObject result = getData().get(id);
    return result;
  }

  public Sink select(Sink s, Integer skip, Integer limit, Comparator order, Predicate predicate) {
    if ( s == null ) {
      s = new ListSink();
    }

    FlowControl fc = (FlowControl)getX().create(FlowControl.class);

    for ( FObject obj : getData().values() ) {
      if ( fc.getStopped() || fc.getErrorEvt() != null ) {
        break;
      }

      s.put(obj, fc);
    }

    if ( fc.getErrorEvt() != null ) {
      s.error();
      return s;
    }

    s.eof();

    return s;
  }

  public void removeAll(Integer skip, Integer limit, Comparator order, Predicate predicate) {
    setData(null);
  }

  public void pipe(Sink s) {
    // TODO
  }
}
