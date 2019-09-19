/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.rope;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.Authorizer;
import foam.nanos.auth.User;
import foam.nanos.rope.ROPEActions;
import foam.nanos.rope.ROPE;
import java.lang.*;
import java.lang.reflect.*;
import foam.dao.ArraySink;
import java.util.List;
import static foam.mlang.MLang.*;

public class ROPEAuthorizer implements Authorizer {

  protected User user_;
  protected DAO ropeDAO_;

  public ROPEAuthorizer(X x) {
    user_ = (User) x.get("user");
    ropeDAO_ = (DAO) x.get("ropeDAO");
  }

  public void authorizeOnCreate(X x, FObject obj) throws AuthorizationException {
    if ( ! ropeSearch(ROPEActions.C, obj, x) ) throw new AuthorizationException("You don't have permission to create this object");
  }

  public void authorizeOnRead(X x, FObject obj) throws AuthorizationException {
    if ( ! ropeSearch(ROPEActions.R, obj, x) ) throw new AuthorizationException("You don't have permission to create this object");
  }

  public void authorizeOnUpdate(X x, FObject oldObj, FObject obj) throws AuthorizationException {
    if ( ! ropeSearch(ROPEActions.U, obj, x) ) throw new AuthorizationException("You don't have permission to create this object");
  }

  public void authorizeOnDelete(X x, FObject obj) throws AuthorizationException {
    String targetModel = obj.getClassInfo().getId();
    if ( ! ropeSearch(ROPEActions.D, obj, x) ) throw new AuthorizationException("You don't have permission to create this object");
  }

  public Object retrieveProperty(FObject obj, String propertyName) {
    Method method;
    try {
        method = obj.getClass().getDeclaredMethod("get" + propertyName);
        method.setAccessible(true);
        return method.invoke((FObject) obj);
    } catch (NoSuchMethodException | SecurityException | IllegalAccessException | IllegalArgumentException
            | InvocationTargetException e) {
        // Should never occur
        System.err.println("ROPE ERROR: Attempted access on non-existant property");
    } 
  }

  public List<ROPE> getTargetRopes(FObject obj) {
    return (List<ROPE>) ((ArraySink) this.ropeDAO_
      .where(EQ(ROPE.TARGET_MODEL, obj.getClassInfo())) // need a search for source_model as well
      .select(new ArraySink()))
      .getArray();
  }

  public boolean ropeSearch(ROPEActions operation, FObject obj, X x) {

    // TODO targetModel is no longer passed in and ROPE.targetModel is now of type CLASS
    String targetClassName = obj.getClassInfo().getId();
    Class targetClass = Class.forName(targetClassName);

    // if the object is the context user itself return true for now TODO
    if ( targetClassName == "foam.nanos.auth.User" && ((User) obj).getId() == this.user_.getId() ) return true;

    List<ROPE> ropes = getTargetRopes(obj);

    for ( ROPE rope : ropes ) {
      DAO junctionDAO = (DAO) x.get(rope.getJunctionDAOKey());
      DAO sourceDAO = (DAO) x.get(rope.getSourceDAOKey());
      List<FObject> sourceObjs; 

      if ( rope.getCardinality().equals("*:*") ) {
        List<FObject> junctionObjs = rope.getIsInverse() ? 
        ((ArraySink) junctionDAO
          .where(
            EQ(rope.getJunctionModel().getAxiomByName("sourceId"), ((Long) retrieveProperty(obj, "Id")).longValue())
          )
          .select(new ArraySink()))
          .getArray() :
        ((ArraySink) junctionDAO
          .where(
            EQ(rope.getJunctionModel().getAxiomByName("targetId"), ((Long) retrieveProperty(obj, "Id")).longValue())
          )
          .select(new ArraySink()))
          .getArray();

        for ( FObject junctionObj : junctionObjs ) {
          FObject sourceObj = rope.getIsInverse() ? (FObject) sourceDAO.find(((Long)retrieveProperty(junctionObj, "TargetId")).longValue()) : (FObject) sourceDAO.find(((Long)retrieveProperty(junctionObj, "SourceId")).longValue());
          sourceObjs.add(sourceObj);
        }
      } else if ( rope.getCardinality().equals("*:1") ) {
        String methodName = "get" + rope.getInverseName().substring(0, 1).toUpperCase() + rope.getInverseName().substring(1);
        Method searchFunction = strToFun(methodName, rope.getTargetModel().getId(), foam.core.X.class);
        DAO rDAO = (DAO) searchFunction.invoke(obj, x);
        sourceObjs = ((ArraySink) rDAO.where(INSTANCE_OF(rope.getSourceModel().getObjClass())).select(new ArraySink())).getArray();
      } else if (rope.getCardinality().equals("1:*") ) {
        String methodName = "find" + rope.getInverseName().substring(0, 1).toUpperCase() + rope.getInverseName().substring(1);
        Method searchFunction = strToFun(methodName, rope.getTargetModel().getId(), foam.core.X.class);
        FObject sourceObj = searchFunction.invoke((FObject) obj, x);
        sourceObjs.add(sourceObj);
      } else return false;
        
      // if the relationship between the src and target is sufficient to permit the operation
      if ( ((List<ROPEActions>) rope.getRelationshipImplies()).contains(operation) && sourceObjs.size() > 0 ) {
       // NOT RETURN TRUE!!!!!!!!!!
       // should recurse on srcObj or return true depending 
       // 
      }

      // if we need to check in the CRUD Matrix
      List<ROPEActions> actions = rope.getCRUD().get(operation);
      if ( actions != null && actions.size() > 0 ) {
        for ( FObject sourceObj : sourceObjs ) {
          for ( ROPEActions action : actions ) {
            if ( ropeSearch(action, sourceObj, x) ) return true;
          }
        }
      }

      return false;
    }
  }


  public boolean checkGlobalRead(X x) {
    return false;
  }

  public boolean checkGlobalRemove(X x) {
    return false;
  }

  public Method strToFun(String methodName, String className, Class... params) {
    Class cls = Class.forName(className);
    return cls.getMethod(methodName, params);
  }

}