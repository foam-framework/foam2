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
import foam.nanos.auth.User;
import foam.nanos.rope.ROPE;
import java.lang.reflect.*;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;
import static foam.mlang.MLang.*;

public class ROPEAuthorizer implements Authorizer {

  protected User user_;
  protected DAO ropeDAO_;
  protected String targetDAOKey_;
  protected Map<FObject, List<ROPE>> seen;

  public ROPEAuthorizer(X x, String targetDAOKey) {
    user_ = (User) x.get("user");
    ropeDAO_ = (DAO) x.get("ropeDAO");
    targetDAOKey_ = targetDAOKey;
    seen = new HashMap<FObject, List<ROPE>>();
  }


  public boolean ropeSearch(String mapkey, FObject obj, X x, String targetDAOKey, String relationshipKey) {
    // Long id = (Long) retrieveProperty(obj, "get", "id");
    // System.out.println("\n\n\nropeSearch("+operation+", {"+obj.getClassInfo().getId()+", "+id+"}, "+targetDAOKey+")");
    // System.out.println("-----------------------------------------------------------------------------------------------------------------------------");

    // terminating condition
    // if ( obj != null && obj instanceof User && ((User) obj).getId() == user_.getId() && operation == ROPEActions.OWN ) {
    //   System.out.println("> targetObject is SELF and targetDAOKey is OWN. Authorization Granted.");
    //   System.out.println("> End of ropeSearch.");
    //   return true;
    // }

    DAO filteredRopeDAO = (DAO) ropeDAO_.where(AND(
      EQ(ROPE.TARGET_MODEL, obj.getClassInfo()),
      EQ(ROPE.TARGET_DAOKEY, targetDAOKey)
    ));
    if ( ! relationshipKey.isEmpty() ) {
      filteredRopeDAO = (DAO) filteredRopeDAO.where(EQ(ROPE.RELATIONSHIP_KEY, relationshipKey));
    }
    List<ROPE> ropes = (List<ROPE>) ((ArraySink) filteredRopeDAO.select(new ArraySink())).getArray();

    // System.out.println("> "+ropes.size() + " ROPEs found.");

    for ( ROPE rope : ropes ) {
      System.out.println("------------------------------------------------- ROPE INFO -----------------------------------------------------------------\nrope = { sourceDAOKey = "+rope.getSourceDAOKey() + ", targetDAOKey = "+rope.getTargetDAOKey()+", relationshipKey = "+rope.getRelationshipKey()+" }");

      if (seen.containsKey(obj) && seen.get(obj).contains(rope)) {
        if (seen.get(obj).contains(rope)) {
          System.out.println("> ROPE has already been SEEN for target object, skipping to next rope");
          continue;
        }
        else {
          seen.get(obj).add(rope);
        }
      }
      else seen.put(obj, new ArrayList<ROPE>(Arrays.asList(rope)));

      // todo ruby
      List<String> nextRelationships = rope.getCRUD() == null ? null : rope.getCRUD().get(mapkey);
      if ( rope.getCRUD() == null || nextRelationships == null || nextRelationships.size() == 0 ) {
        System.out.println("> ROPE does not grant desired targetAction, continue to next rope");
        continue;
      }

      List<FObject> sourceObjs = getSourceObjects(x, rope, obj);


      if(rope.getCRUD()!=null)System.out.println("> CRUD = " + rope.getCRUD());

      if ( nextRelationships != null && nextRelationships.size() > 0 ) {

        for ( FObject sourceObj : sourceObjs ) {
          for ( String nextRelationship : nextRelationships ) {
            if ( ropeSearch(rope.getRelationshipKey(), sourceObj, x, rope.getSourceDAOKey(), nextRelationship) ) return true;
          }
        }
      }

      System.out.println("-----------------------------------------------------------------------------------------------------------------------------");
    }

    return false; 
  }

  public List<FObject> getSourceObjects(X x, ROPE rope, FObject obj) {
    List<FObject> sourceObjs = new ArrayList(); 

    if ( rope.getCardinality().equals("*:*") ) {

      foam.dao.ManyToManyRelationshipImpl relationship = (foam.dao.ManyToManyRelationshipImpl) retrieveProperty(obj, "get", rope.getRelationshipKey(), x);
      List<FObject> junctionObjs = (List<FObject>) ( (ArraySink) relationship.getJunctionDAO().where(
        EQ(relationship.getJunction().getAxiomByName("sourceId"), (Long) retrieveProperty(obj, "get", "id"))
      )
      .select(new ArraySink()))
      .getArray();

      for ( FObject junctionObj : junctionObjs ) {
        FObject sourceObj = (FObject) x.get(relationship.getTargetDAOKey())
                    .find(((Long)retrieveProperty(junctionObj, "get", "sourceId")).longValue());
        sourceObjs.add(sourceObj);
    }

    } else if ( rope.getCardinality().equals("*:1") ) {
      DAO rDAO = retrieveProperty(obj, "get", rope.getRelationshipKey(), x);
      sourceObjs = ((ArraySink) rDAO.where(INSTANCE_OF(rope.getSourceModel().getObjClass())).select(new ArraySink())).getArray();
    } else if (rope.getCardinality().equals("1:*") ) {
      FObject sourceObj = retrieveProperty(obj, "find", rope.getRelationshipKey(), x);
      sourceObjs.add(sourceObj);
    } else return sourceObjs;

    String str = "> SOURCEOBJS : { ";
    for(FObject srcobj : sourceObjs) {
      Long objid = (Long) retrieveProperty(srcobj, "get", "id");
      str += objid + ",";
    }
    str = str.substring(0, str.length() - 1);
    str += " }";
    System.out.println(str);
    
    return sourceObjs;
  }

  public <T> T retrieveProperty(FObject obj, String prefix, String propertyName, X... x) {
    Method method;
    try {
      method = x.length > 0 ? 
        obj.getClass().getDeclaredMethod(
          prefix + 
          propertyName.substring(0, 1).toUpperCase() + 
          propertyName.substring(1),
          X.class
        ) :
        obj.getClass().getDeclaredMethod(
          prefix + 
          propertyName.substring(0, 1).toUpperCase() + 
          propertyName.substring(1)
        );
        method.setAccessible(true);

        T ret = x.length > 0 ? (T) method.invoke((FObject) obj, x[0]) : (T) method.invoke((FObject) obj);
        return ret;
    } catch (NoSuchMethodException | SecurityException | IllegalAccessException | IllegalArgumentException
            | InvocationTargetException e) {
        System.err.println("ROPE ERROR: Attempted access on non-existant property ");
        e.printStackTrace();
    } 
    return null;
  }




  public void authorizeOnCreate(X x, FObject obj) throws AuthorizationException {
    if ( ! ropeSearch("create", obj, x, targetDAOKey_, "") ) throw new AuthorizationException("You don't have permission to create this object");
  }

  public void authorizeOnRead(X x, FObject obj) throws AuthorizationException {
    if ( ! ropeSearch("read", obj, x, targetDAOKey_, "") ) throw new AuthorizationException("You don't have permission to read this object");
  }

  public void authorizeOnUpdate(X x, FObject oldObj, FObject obj) throws AuthorizationException {
    if ( ! ropeSearch("update", obj, x, targetDAOKey_, "") ) throw new AuthorizationException("You don't have permission to update this object");
  }

  public void authorizeOnDelete(X x, FObject obj) throws AuthorizationException {
    if ( ! ropeSearch("delete", obj, x, targetDAOKey_, "") ) throw new AuthorizationException("You don't have permission to delete this object");
  }

  public boolean checkGlobalRead(X x) {
    return false;
  }

  public boolean checkGlobalRemove(X x) {
    return false;
  }

}