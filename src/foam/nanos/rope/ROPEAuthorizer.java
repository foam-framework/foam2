/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.rope;

import foam.core.FObject;
import foam.core.X;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.Authorizer;
import foam.nanos.auth.User;
import foam.nanos.rope.ROPECell;
import java.lang.reflect.*;

public class ROPEAuthorizer implements Authorizer {

  protected User user_;
  protected DAO ropeDAO_;

  public ROPEAuthorizer() {
    user_ = (User) x.get("user");
    ropeDAO_ = (DAO) x.get("ropeDAO");
  }

  public void authorizeOnCreate(X x, FObject obj) throws AuthorizationException {
    String targetModel = obj.getClassInfo().getId();
    if ( ! relationshipTreeSearch(targetModel, "C", obj) ) throw new AuthorizationException("You don't have permission to create this object");
  }

  public void authorizeOnRead(X x, FObject obj) throws AuthorizationException {
    String targetModel = obj.getClassInfo().getId();
    if ( ! relationshipTreeSearch(targetModel, "R", obj) ) throw new AuthorizationException("You don't have permission to create this object");
  }

  public void authorizeOnUpdate(X x, FObject oldObj, FObject obj) throws AuthorizationException {
    String targetModel = obj.getClassInfo().getId();
    if ( ! relationshipTreeSearch(targetModel, "U", obj) ) throw new AuthorizationException("You don't have permission to create this object");
  }

  public void authorizeOnDelete(X x, FObject obj) throws AuthorizationException {
    String targetModel = obj.getClassInfo().getId();
    if ( ! relationshipTreeSearch(targetModel, "D", obj) ) throw new AuthorizationException("You don't have permission to create this object");
  }

  public boolean relationshipTreeSearch(String targetModel, String operation, FObject obj) {

    // if the object is the context user itself return true for now TODO
    if ( targetModel == "foam.nanos.auth.User" && ((User) obj).getId() == this.user_.getId() ) return true;



    List<ROPECell> ropes = (List<ROPECell>) ((ArraySink) ropeDAO
      .where(AND(
        EQ(ROPECell.TARGET_MODEL, targetModel),
        EQ(ROPECell.COLUMN, operation),
        EQ(ROPECell.CHECKED, true)
      ))
      .select(new ArraySink()))
      .getArray();
    DAO searchDAO, sourceDAO;
    Class targetClass = Class.forName(targetModel);
    Class junctionClass, sourceClass;
    String searchFunctionName;
    Method searchFunction;
    for ( ROPECell rope : ropes ) { // for the case of *:* relationship
      junctionClass = Class.forName(rope.getJunctionModel());
      sourceClass = Class.forName(rope.getSourceModel());
      sourceDAO = x.get(rope.getSourceDAOKey());
      inverseName = rope.getInverseName();
      searchFunctionName = "get" + inverseName.substring(0, 1).toUpperCase() + inverseName.substring(1);
      searchFunction = targetClass.getMethod(searchFunctionName, foam.core.X);

      // if getInverse returns true, this should be junctionModel.SOURCE_ID
      List<junctionClass> junctionObjs = ((ArraySink) ((targetClass) obj).searchFunction(x).getJunctionDAO().where(junctionModel.TARGET_ID, (targetClass) obj.getId()).select(new ArraySink())).getArray();
      for ( junctionClass junctionObj : junctionObj ) {
        sourceClass sourceObj = (sourceClass) sourceDAO.find(junctionObj.getSourceId());
        relationshipTreeSearch(sourceObj.getClassInfo().getId(), rope.getRow(), obj);
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