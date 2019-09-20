/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.rope;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.Authorizer;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import foam.nanos.rope.ROPE;
import foam.nanos.rope.ROPEActions;
import java.lang.*;
import java.lang.reflect.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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

  public <T> T retrieveProperty(FObject obj, String prefix, String propertyName) {
    Method method;
    try {
        method = obj.getClass().getDeclaredMethod(prefix + propertyName.substring(0, 1).toUpperCase() + propertyName.substring(1));
        method.setAccessible(true);
        return (T) method.invoke((FObject) obj);
    } catch (NoSuchMethodException | SecurityException | IllegalAccessException | IllegalArgumentException
            | InvocationTargetException e) {
        // Should never occur
        System.err.println("ROPE ERROR: Attempted access on non-existant property");
    } 
    return null;
  }

  public List<ROPE> getTargetRopes(FObject obj) {
    return (List<ROPE>) ((ArraySink) this.ropeDAO_
      .where(EQ(ROPE.TARGET_MODEL, obj.getClassInfo())) // need a search for source_model as well
      .select(new ArraySink()))
      .getArray();
  }

  public boolean terminatingSearch(X x, FObject obj) {
    if ( ((User) obj).getId() == user_.getId() ) return true;
    /**
     * TODO
     * look in the ropedao where sourceModel is either user-business 
     * and check if the context user is the admin of the business related to user obj
     * if so, grant the appropriate permissions
     * else don't
     */ 
    return false;
  }

  public boolean ropeSearch(ROPEActions operation, FObject obj, X x) {

    // if the object is the context user itself return true for now TODO
    if ( obj.getClassInfo().getId() == User.getOwnClassInfo().getId() ) {
      return terminatingSearch(x, obj);
    }

    List<ROPE> ropes = getTargetRopes(obj);

    for ( ROPE rope : ropes ) {
      DAO junctionDAO = (DAO) x.get(rope.getJunctionDAOKey());
      DAO sourceDAO = (DAO) x.get(rope.getSourceDAOKey());
      List<FObject> sourceObjs = new ArrayList(); 

      if ( rope.getCardinality().equals("*:*") ) {
        Object predicateProperty = rope.getIsInverse() ? rope.getJunctionModel().getAxiomByName("sourceId") : rope.getJunctionModel().getAxiomByName("targetId");
        List<FObject> junctionObjs = ((ArraySink) junctionDAO
          .where(
            EQ(predicateProperty, (Long) retrieveProperty(obj, "get", "id"))
          )
          .select(new ArraySink()))
          .getArray();

        for ( FObject junctionObj : junctionObjs ) {
          FObject sourceObj = rope.getIsInverse() ? (FObject) sourceDAO.find(((Long)retrieveProperty(junctionObj, "get", "targetId")).longValue()) : (FObject) sourceDAO.find(((Long)retrieveProperty(junctionObj, "get", "sourceId")).longValue());
          sourceObjs.add(sourceObj);
        }
      } else if ( rope.getCardinality().equals("*:1") ) {
        DAO rDAO = retrieveProperty(obj, "get", rope.getInverseName());
        sourceObjs = ((ArraySink) rDAO.where(INSTANCE_OF(rope.getSourceModel().getObjClass())).select(new ArraySink())).getArray();
      } else if (rope.getCardinality().equals("1:*") ) {
        FObject sourceObj = retrieveProperty(obj, "find", rope.getInverseName());
        sourceObjs.add(sourceObj);
      } else return false;
        
      // if the relationship between the src and target is sufficient to permit the operation
      if ( ( rope.getRelationshipImplies()).contains(operation) && sourceObjs.size() > 0 ) {
        /**
        * TODO
        * recursively call the search function on the sourceobj, if true return
        * if false, want to go to next step to check if crud will return true
        */ 
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
    }

    return false; 
  }


  public boolean checkGlobalRead(X x) {
    return false;
  }

  public boolean checkGlobalRemove(X x) {
    return false;
  }

}