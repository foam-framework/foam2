package foam.dao;

import com.google.appengine.api.datastore.*;
import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.X;
import foam.core.PropertyInfo;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

import java.util.List;

// TODO: Deep serialization

/**
 * DAO Strategy for storing in AppEngine Datastore.
 **/
public class DatastoreDAO
        extends AbstractDAO {
    protected ClassInfo of_ = null;
    protected PropertyInfo primaryKey_ = null;
    protected DatastoreService datastore_ = DatastoreServiceFactory.getDatastoreService();

    protected DatastoreService getData() {
        return datastore_;
    }

    public ClassInfo getOf() {
        return of_;
    }

    public DatastoreDAO setOf(ClassInfo of) {
        of_ = of;
        primaryKey_ = (PropertyInfo) of.getAxiomByName("id");
        return this;
    }

    public PropertyInfo getPrimaryKey() {
        return primaryKey_;
    }

    protected List<PropertyInfo> getProperties(ClassInfo c) {
        return (List<PropertyInfo>) c.getAxiomsByClass(PropertyInfo.class);
    }

    protected Key keyFromPK(Object key) {
        return KeyFactory.createKey(getOf().getId(), key.toString());
    }

    protected Key keyFromFObject(FObject obj) {
        return keyFromPK(getPrimaryKey().get(obj));
    }

    public FObject put_(X x, FObject obj) {
        getData().put(serializeFObject(obj));
        return obj;
    }

    public FObject remove_(X x, FObject obj) {
        getData().delete(keyFromFObject(obj));
        return obj;
    }

    public FObject find_(X x, Object id) {
        Entity result;
        try {
            result = getData().get(keyFromPK(id));
        } catch (EntityNotFoundException e) {
            return null;
        }

        return deserialize(result);
    }

    protected PropertyContainer serialize(PropertyContainer target, FObject obj) {
        ClassInfo info = obj.getClassInfo();

        List<PropertyInfo> properties = getProperties(info);

        // TODO: Is cls_ a reserved word for properties?
        target.setProperty("cls_", info.getId());

        for (PropertyInfo prop : properties) {
            Object value = prop.get(obj);

            if (value instanceof FObject) {
                EmbeddedEntity subEntity = new EmbeddedEntity();
                serialize(subEntity, (FObject) value);
                value = subEntity;
            }

            target.setProperty(prop.getName(), value);
        }

        return target;
    }

    protected Entity serializeFObject(FObject o) {
        Entity entity = new Entity(keyFromFObject(o));

        serialize(entity, o);

        return entity;
    }

    protected FObject deserialize(PropertyContainer e) {
        String classId = (String) e.getProperty("cls_");

        FObject obj;

        try {
            obj = (FObject) getX().create(Class.forName(classId));
        } catch (ClassNotFoundException exception) {
            throw new RuntimeException(exception);
        }

        List<PropertyInfo> props = getProperties(obj.getClassInfo());

        for (PropertyInfo prop : props) {
            if (!e.hasProperty(prop.getName())) {
                continue;
            }

            Object value = e.getProperty(prop.getName());

            if (value instanceof EmbeddedEntity) {
                value = deserialize((EmbeddedEntity) value);
            }

            prop.set(obj, value);
        }

        return obj;
    }

    public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
        if ( sink == null ) {
            sink = new ListSink();
        }

        Sink decorated = decorateSink_(sink, skip, limit, order, predicate);

        Subscription sub = getX().create(foam.dao.Subscription.class);

        // TODO: Richer query handling

        PreparedQuery query = getData().prepare(new Query(getOf().getId()));

        for (Entity e : query.asIterable()) {
            FObject obj = deserialize(e);

            if (sub.getDetached()) {
                break;
            }

            decorated.put(obj, sub);
        }

        decorated.eof();

        return sink;
    }

    public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    }

    public void pipe_(X x, Sink s) {
        // TODO
    }
}
