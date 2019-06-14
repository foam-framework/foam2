/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao;

import foam.core.*;
import foam.dao.index.*;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Or;
import foam.mlang.predicate.Predicate;
import foam.mlang.sink.GroupBy;
import foam.nanos.logger.Logger;
import java.util.ArrayList;
import java.util.List;

/**
 The MDAO class for an ordering, fast lookup, single value,
 index multiplexer, or any other MDAO select() assistance class.

 The assitance class TreeiNdex implements the
 data nodes that hold the indexed items and plan and execute
 queries. For any particular operational Index, there may be
 many IndexNode instances:

 <pre>
 1---------> TreeIndex(id)
 MDAO: AltIndex 2---------> TreeIndex(propA) ---> TreeIndex(id) -------------> ValueIndex
 | 1x AltIndexNode    | 1x TreeIndexNode    | 14x TreeIndexNodes         | (DAO size)x ValueIndexNodes
 (2 alt subindexes)     (14 nodes)             (each has 0-5 nodes)
 </pre>
 The base AltIndex has two complete subindexes (each holds the entire DAO).
 The TreeIndex on property A has created one TreeIndexNode, holding one tree of 14 nodes.
 Each tree node contains a tail instance of the next level down, thus
 the TreeIndex on id has created 14 TreeIndexNodes. Each of those contains some number
 of tree nodes, each holding one tail instance of the ValueIndex at the end of the chain.

 */
 // TODO: clone and freeze objects stored in memory
public class MDAO
  extends AbstractDAO
{
  protected AltIndex index_;
  protected Object   state_ = null;
  protected Object   writeLock_ = new Object();

  public MDAO(ClassInfo of) {
    setOf(of);
    index_ = new AltIndex(new TreeIndex((PropertyInfo) this.of_.getAxiomByName("id")));
  }

  public void addIndex(Index index) {
    index_.addIndex(index);
  }

  /** Add an Index which is for a unique value. **/
  public void addUniqueIndex(PropertyInfo... props) {
    Index i = ValueIndex.instance();
    for ( PropertyInfo prop : props ) i = new AltIndex(prop, i);
    return i;
  }

  /** Add an Index which is for a non-unique value. The 'id' property is
   * appended to property list to make it unique.
   **/
  public void addIndex(PropertyInfo... props) {
    Index i = new TreeIndex((PropertyInfo) this.of_.getAxiomByName("id"));
    for ( PropertyInfo prop : props ) i = new AltIndex(prop, i);
    return i;
  }

  synchronized Object getState() {
    return state_;
  }

  synchronized void setState(Object state) {
    state_ = state;
  }

  public FObject objIn(FObject obj) {
    return obj.fclone().freeze();
  }

  public FObject objOut(FObject obj) {
    return AbstractFObject.maybeClone(obj);
  }

  public FObject put_(X x, FObject obj) {
    // Clone and freeze outside of lock to minimize time spent under lock
    obj = objIn(obj);

    synchronized ( writeLock_ ) {
      FObject oldValue = find_(x, obj);
      Object  state    = getState();

      if ( oldValue != null ) {
        state = index_.remove(state, oldValue);
      }

      setState(index_.put(state, obj));
    }

    onPut(obj);
    return obj;
  }

  public FObject remove_(X x, FObject obj) {
    if ( obj == null ) return null;

    FObject found;

    synchronized ( writeLock_ ) {
      found = find_(x, obj);

      if ( found != null ) {
        setState(index_.remove(getState(), found));
      }
    }

    if ( found != null ) {
      onRemove(found);
    }

    return found;
  }

  public FObject find_(X x, Object o) {
    Object state;

    state = getState();

    if ( o == null ) return null;

    return objOut(
        getOf().isInstance(o)
          ? (FObject) index_.planFind(state, getPrimaryKey().get(o)).find(state, getPrimaryKey().get(o))
          : (FObject) index_.planFind(state, o).find(state,o)
    );
  }

  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    SelectPlan plan;
    Predicate  simplePredicate = null;

    // use partialEval to wipe out such useless predicate such as: And(EQ()) ==> EQ(), And(And(EQ()),GT()) ==> And(EQ(),GT())
    if ( predicate != null ) simplePredicate = predicate.partialEval();

    Object state = getState();

    // We handle OR logic by seperate request from MDAO. We return different plan for each parameter of OR logic.
    if ( simplePredicate instanceof Or ) {
      Sink dependSink = new ArraySink();
      // When we have groupBy, order, skip, limit such requirement, we can't do it separately so I replace a array sink to temporarily holde the whole data
      //Then after the plan wa slelect we change it to the origin sink
      int length = ( (Or) simplePredicate ).getArgs().length;
      List<Plan> planList = new ArrayList<>();
      for ( int i = 0; i < length; i++ ) {
        Predicate arg = ( (Or) simplePredicate ).getArgs()[i];
        planList.add(index_.planSelect(state, dependSink, 0, AbstractDAO.MAX_SAFE_INTEGER, null, arg));
      }
      plan = new OrPlan(simplePredicate, planList);
    } else {
      plan = index_.planSelect(state, sink, skip, limit, order, simplePredicate);
    }

    if ( state != null && predicate != null && plan.cost() > 1000 && plan.cost() >= index_.size(state) ) {
      Logger logger = (Logger) x.get("logger");
      if ( ! predicate.equals(simplePredicate) ) logger.debug(String.format("The original predicate was %s but it was simplified to %s.", predicate.toString(), simplePredicate.toString()));
      logger.warning("Unindexed search on MDAO", simplePredicate.toString());
    }

    plan.select(state, sink, skip, limit, order, simplePredicate);

    return sink;
  }

  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    if ( predicate == null ) {
      synchronized ( writeLock_ ) {
        setState(null);
      }
    } else {
      super.removeAll_(x, skip, limit, order, predicate);
    }
  }
}
