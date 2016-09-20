package foam.dao;

import com.google.appengine.api.datastore.*;
import foam.core.*;
import java.util.List;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

// TODO: Deep serialization

public class DatastoreDAO extends AbstractDAO {
  private ClassInfo of_ = null;
  private PropertyInfo primaryKey_ = null;

  private DatastoreService datastore_ = DatastoreServiceFactory.getDatastoreService();
  private DatastoreService getData() { return datastore_; }

  public ClassInfo getOf() {
    return of_;
  }

  public DatastoreDAO setOf(ClassInfo of) {
    of_ = of;
    primaryKey_ = (PropertyInfo)of.getAxiomByName("id");
    return this;
  }

  public PropertyInfo getPrimaryKey() {
    return primaryKey_;
  }

  private List<PropertyInfo> getProperties(ClassInfo c) {
    return (List<PropertyInfo>)c.getAxiomsByClass(PropertyInfo.class);
  }

  private Key keyFromPK(Object key) {
    return KeyFactory.createKey(getOf().getId(), key.toString());
  }

  private Key keyFromFObject(FObject obj) {
    return keyFromPK(getPrimaryKey().get(obj));
  }

  public FObject put(FObject obj) {
    getData().put(serialize(obj));
    return obj;
  }

  public FObject remove(FObject obj) {
    getData().delete(keyFromFObject(obj));
    return obj;
  }

  public FObject find(Object id) {
    Entity result;
    try {
      result = getData().get(keyFromPK(id));
    } catch(EntityNotFoundException e) {
      return null;
    }

    return deserialize(result);
  }

  private Entity serialize(FObject o) {
    Entity entity = new Entity(keyFromFObject(o));

    ClassInfo info = o.getClassInfo();

    List<PropertyInfo> properties = getProperties(info);

    // TODO: Is cls_ a reserved work for properties?
    entity.setProperty("cls_", info.getId());

    for ( PropertyInfo prop : properties ) {
      entity.setProperty(prop.getName(), prop.get(o));
    }

    return entity;
  }

  private FObject deserialize(Entity e) {
    String classId = (String)e.getProperty("cls_");

    FObject obj;

    try {
      obj = (FObject)getX().create(Class.forName(classId));
    } catch(ClassNotFoundException exception) {
      throw new RuntimeException(exception);
    }

    List<PropertyInfo> props = getProperties(obj.getClassInfo());

    for ( PropertyInfo prop : props ) {
      prop.set(obj, e.getProperty(prop.getName()));
    }

    return obj;
  }

  public Sink select(Sink sink, Integer skip, Integer limit, Comparator order, Predicate predicate) {
    if ( sink == null ) {
      sink = new ListSink();
    }

    Sink decorated = decorateSink_(sink, skip, limit, order, predicate);

    FlowControl fc = (FlowControl)getX().create(FlowControl.class);

    // TODO: Richer query handling

    PreparedQuery query = getData().prepare(new Query(getOf().getId()));

    for ( Entity e : query.asIterable() ) {
      FObject obj = deserialize(e);

      if ( fc.getStopped() || fc.getErrorEvt() != null ) {
        break;
      }

      decorated.put(obj, fc);
    }

    if ( fc.getErrorEvt() != null ) {
      decorated.error();
      return sink;
    }

    decorated.eof();

    return sink;
  }

  public void removeAll(Integer skip, Integer limit, Comparator order, Predicate predicate) {
  }

  public void pipe(Sink s) {
    // TODO
  }
}
