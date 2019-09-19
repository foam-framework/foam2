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
import foam.nanos.rope.ROPECell;
import foam.nanos.rope.ROPEActions;
import foam.nanos.rope.ROPE;
import java.lang.*;
import foam.dao.ArraySink;
import java.util.List;

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
    if ( ! ropeSearch(targetModel, ROPEActions.D, obj, x) ) throw new AuthorizationException("You don't have permission to create this object");
  }

  public boolean ropeSearch(String targetModel, ROPEActions operation, FObject obj, X x) {

    // TODO targetModel is no longer passed in and ROPE.targetModel is now of type CLASS
    Class targetClass = Class.forName(targetModel);

    // if the object is the context user itself return true for now TODO
    if ( targetModel == "foam.nanos.auth.User" && ((User) obj).getId() == this.user_.getId() ) return true;

    List<ROPE> ropes = (List<ROPE>) ((ArraySink) this.ropeDAO_
      .where(EQ(ROPE.TARGET_MODEL, targetModel)) // need a search for source_model as well
      .select(new ArraySink()))
      .getArray();

    for ( ROPE rope : ropes ) {
      DAO junctionDAO = (DAO) x.get(rope.getJunctionDAOKey());
      Class junctionClass = Class.forName(rope.getJunctionModel());
      DAO sourceDAO = (DAO) x.get(rope.getSourceDAOKey());
      Class sourceClass = Class.forName(rope.getSourceModel());
      List<sourceClass> sourceObjs;

      if ( rope.getCardinality().equals("*:*") ) {
        List<junctionClass> junctionObjs = ((ArraySink) junctionDAO
          .where(
            OR(
              AND(!rope.getIsInverse(), EQ(junctionClass.TARGET_ID, (targetClass) obj.getId())),
              AND(rope.getIsInverse(), EQ(junctionClass.SOURCE_ID, (targetClass) obj.getId()))
            )
          )
          .select(new ArraySink()))
          .getArray();

        for ( junctionClass junctionObj : junctionObjs ) {
          sourceClass sourceObj = rope.getIsInverse() ? (sourceClass) sourceDAO.find(junctionObj.getTargetId()) : (sourceClass) sourceDAO.find(junctionObj.getSourceId());
          sourceObjs.add(sourceObj);
        }
      } else if ( rope.getCardinality().equals("*:1") ) {
        String methodName = "get" + rope.getInverseName().substring(0, 1).toUpperCase() + rope.getInverseName().substring(1);
        Method searchFunction = strToFun(methodName, rope.getTargetModel(), foam.core.X.class);
        sourceObjs = ((ArraySink) searchFunction.invoke((targetClass) obj, x).where(INSTANCE_OF(sourceClass.class)).select(new ArraySink())).getArray();
      } else if (rope.getCardinality().equals("1:*") ) {
        String methodName = "find" + rope.getInverseName().substring(0, 1).toUpperCase() + rope.getInverseName().substring(1);
        Method searchFunction = strToFun(methodName, rope.getTargetModel(), foam.core.X.class);
        sourceClass sourceObj = searchFunction.invoke((targetClass) obj, x);
        sourceObjs.add(sourceObj);
      } else return false;
        
      // if the relationship between the src and target is sufficient to permit the operation
      if ( rope.getRelationshipImplies().contains(operation) && sourceObjs.size() > 0 ) return true;

      // if we need to check in the CRUD Matrix
      List<ROPEActions> actions = rope.getCRUD().get(operation);
      if ( actions != null && actions.size() > 0 ) {
        for ( sourceClass sourceObj : sourceObjs ) {
          for ( ROPEActions action : actions ) {
            if ( ropeSearch(rope.getSourceModel(), action, sourceObj, x) ) return true;
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