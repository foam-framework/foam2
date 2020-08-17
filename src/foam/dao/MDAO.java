/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.dao;

import foam.core.*;
import foam.dao.index.*;
import foam.mlang.MLang;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Or;
import foam.mlang.predicate.Predicate;
import foam.mlang.sink.GroupBy;
import foam.nanos.logger.Logger;
import foam.nanos.pm.PM;
import java.util.ArrayList;
import java.util.List;
import java.util.HashSet;
import java.util.Set;

/**
 The MDAO class for an ordering, fast lookup, single value,
 index multiplexer, or any other MDAO select() assistance class.

 The assitance class TreeIndex implements the
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
  public static class DetachSelect implements Detachable {
    private static Detachable instance__ = new DetachSelect();
    public  static Detachable instance() { return instance__; }

    public void detach() {
      throw DetachSelectException.instance();
    }
  }

  public static class DetachSelectException extends RuntimeException {
    private static StackTraceElement[] EMPTY_STACK = new StackTraceElement[0];

    private static DetachSelectException instance__ = new DetachSelectException();
    public  static DetachSelectException instance() { return instance__; }

    public void detach() {
      throw DetachSelectException.instance();
    }

    public StackTraceElement[] getStackTrace() {
      return EMPTY_STACK;
    }
  }

  protected AltIndex index_;
  protected Object   state_     = null;
  protected Object   writeLock_ = new Object();
  protected Set      unindexed_ = new HashSet();

  public MDAO(ClassInfo of) {
    setOf(of);
    index_ = new AltIndex(new TreeIndex((PropertyInfo) this.of_.getAxiomByName("id")));
  }

  public void addIndex(Index index) {
    synchronized ( writeLock_ ) {
      state_ = index_.addIndex(state_, index);
    }
  }

  /** Add an Index which is for a unique value. Use addIndex() if the index is not unique. **/
  public void addUniqueIndex(PropertyInfo... props) {
    Index i = ValueIndex.instance();
    for ( PropertyInfo prop : props ) i = new TreeIndex(prop, i);
    addIndex(i);
  }

  /** Add an Index which is for a non-unique value. The 'id' property is
   * appended to property list to make it unique.
   **/
  public void addIndex(PropertyInfo... props) {
    Index i = new TreeIndex((PropertyInfo) this.of_.getAxiomByName("id"));
    for ( PropertyInfo prop : props ) i = new TreeIndex(prop, i);
    addIndex(i);
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
    return obj;
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

    // TODO: PM unindexed plans
    return objOut(
      getOf().isInstance(o)
        ? (FObject) index_.planFind(state, getPrimaryKey().get(o)).find(state, getPrimaryKey().get(o))
        : (FObject) index_.planFind(state, o).find(state, o)
    );
  }

  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    Logger     logger = (Logger) x.get("logger");
    SelectPlan plan;
    Predicate  simplePredicate = null;
    PM         pm = null;

    // use partialEval to wipe out such useless predicate such as: And(EQ()) ==> EQ(), And(And(EQ()),GT()) ==> And(EQ(),GT())
    if ( predicate != null ) simplePredicate = predicate.partialEval();

    Object state = getState();

    // We handle OR logic by seperate request from MDAO. We return different plan for each parameter of OR logic.
    if ( simplePredicate instanceof Or ) {
      Sink dependSink = new ArraySink();
      // When we have groupBy, order, skip, limit such requirement, we can't do it separately so I replace a array sink to temporarily holde the whole data
      //Then after the plan wa slelect we change it to the origin sink
      int length = ((Or) simplePredicate).getArgs().length;
      List<Plan> planList = new ArrayList<>();
      for ( int i = 0 ; i < length ; i++ ) {
        Predicate arg = ((Or) simplePredicate).getArgs()[i];
        planList.add(index_.planSelect(state, dependSink, 0, AbstractDAO.MAX_SAFE_INTEGER, null, arg));
      }
      plan = new OrPlan(simplePredicate, planList);
    } else {
      plan = index_.planSelect(state, sink, skip, limit, order, simplePredicate);
    }

    if ( state != null && simplePredicate != null && simplePredicate != MLang.TRUE && plan.cost() > 10 && plan.cost() >= index_.size(state) ) {
      pm = new PM(this.getClass(), "MDAO:UnindexedSelect:" + getOf().getId());
      if ( ! unindexed_.contains(getOf().getId())) {
        if ( ! predicate.equals(simplePredicate) && logger != null ) {
          logger.debug(String.format("The original predicate was %s but it was simplified to %s.", predicate.toString(), simplePredicate.toString()));
        }
        unindexed_.add(getOf().getId());
        if ( logger != null ) {
          logger.warning("Unindexed search on MDAO", getOf().getId(), simplePredicate.toString(), plan.toString());
        }
      }
    }

    try {
      plan.select(state, sink, skip, limit, order, simplePredicate);
    } catch (DetachSelectException e) {
      // NOP, not a real exception, just used to terminate a select early
    }

    if ( pm != null ) pm.log(x);

    sink.eof();
    return sink;
  }

  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    if ( predicate == null && skip == 0 && limit == MAX_SAFE_INTEGER ) {
      synchronized ( writeLock_ ) {
        setState(null);
      }
    } else {
      super.removeAll_(x, skip, limit, order, predicate);
    }
  }
}
