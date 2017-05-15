// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
package foam.dao;

public interface DAO {
    public foam.core.FObject put(foam.core.FObject obj);

    public foam.core.FObject remove(foam.core.FObject obj);

    public foam.core.FObject find(Object id);

    public foam.dao.Sink select(foam.dao.Sink sink, Integer skip, Integer limit, foam.mlang.order.Comparator order, foam.mlang.predicate.Predicate predicate);

    public void removeAll(Integer skip, Integer limit, foam.mlang.order.Comparator order, foam.mlang.predicate.Predicate predicate);

    public void listen();

    public void pipe(foam.dao.Sink sink);

    public foam.dao.DAO where(foam.mlang.predicate.Predicate predicate);

    public foam.dao.DAO orderBy(foam.mlang.order.Comparator comparator);

    public foam.dao.DAO skip(int count);

    public foam.dao.DAO limit(int count);

}