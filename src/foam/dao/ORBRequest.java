package foam.dao;

import foam.core.FObject;

/**
 * ORBRequest objects are used to pass method call arguments to ORBitalDAOs request brokers.
 */
public class ORBRequest{

  /** receiverObject can be the ID of the Object or a direct reference to it */
  private FObject receiverObject;
  private String receiverObjectID;

  private String methodName;
  private Object[] args;

  /** An ORBRequest can be constructed using a reference to the actual request receiver */
  public ORBRequest(FObject receiverObject, String methodName, Object[] args){
    this.receiverObject = receiverObject;
    this.methodName = methodName;
    this.args = args;
  }

  /** An ORBRequest can be constructed using the id of the request receiver */
  public ORBRequest(String receiverObjectID, String methodName, Object[] args){
    this.receiverObjectID = receiverObjectID;
    this.methodName = methodName;
    this.args = args;
  }

  public FObject getReceiverObject() {
    return receiverObject;
  }

  public String getReceiverObjectID() {
    return receiverObjectID;
  }

  public String getMethodName() {
    return methodName;
  }

  public Object[] getArgs() {
    return args;
  }

}
