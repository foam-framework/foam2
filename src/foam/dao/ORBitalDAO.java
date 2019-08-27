package foam.dao;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.MethodInfo;
import foam.core.X;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

/**
 * DAO class used to delegate a method execution request to the specified object (specified by an ORBRequest object).
 */
public class ORBitalDAO extends foam.dao.AbstractDAO{

  /**
   * Method that delegates execution to method of object specified by {@param obj}
   *
   * @param obj argument must be an ORBRequest object
   */
  @Override
  public Object cmd_(foam.core.X x, Object obj){
    ORBRequest request = (ORBRequest) obj;
    String receiverID = request.getReceiverObjectID();

    // Find the object if the request is by ID
    FObject receiverObj =  ( receiverID == null )? request.getReceiverObject() : (FObject) x.get(request.getReceiverObjectID());

    ClassInfo classInfo = receiverObj.getClassInfo();
    MethodInfo methodInfo = (MethodInfo) classInfo.getAxiomByName(request.getMethodName());

    return methodInfo.call(x, receiverObj, request.getArgs());
  }

  @Override
  public FObject put_(X x, FObject obj) {
    return null;
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    return null;
  }

  @Override
  public FObject find_(X x, Object id) {
    return null;
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    return null;
  }

}
