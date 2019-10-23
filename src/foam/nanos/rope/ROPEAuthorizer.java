/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.rope;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.Authorizer;
import foam.nanos.rope.ROPE;
import foam.nanos.auth.User;

public class ROPEAuthorizer implements Authorizer {

  protected User user_;
  protected DAO ropeDAO_;
  protected String targetDAOKey_;

  public ROPEAuthorizer(X x, String targetDAOKey) {
    user_ = (User) x.get("user");
    ropeDAO_ = (DAO) x.get("ropeDAO");
    targetDAOKey_ = targetDAOKey;
  }

  public boolean ropeSearch(X x, FObject obj, String targetDAOKey, String crudKey, String relationshipKey, String propertyKey) {

    // get all the ropes associated with the targetDAO
    DAO filteredRopeDAO = (DAO) ropeDAO_.where(AND(EQ(ROPE.TARGET_DAOKEY, targetDAOKey)));

    // if there is a relationship key to search for, filter the ropedao based on relationshipKey
    if ( ! relationshipKey.isEmpty() ) {
      filteredRopeDAO = (DAO) filteredRopeDAO.where(EQ(ROPE.RELATIONSHIP_KEY, relationshipKey));
    }

    List<ROPE> ropes = (List<ROPE>) ((ArraySink) filteredRopeDAO.select(new ArraySink())).getArray();

    // check each rope
    for ( ROPE rope : ropes ) {

      // get the list of next relationships to search to pass this rope
      List<String> nextRelationships = getNextRelationships(rope, relationshipKey, crudKey, propertyKey);

      // if a there are no results, continue to the next rope
      if ( nextRelationships == null || nextRelationships.size() == 0 ) continue;

      // get the list of sourceObjs that have a relationship with the largetObj
      List<FObject> sourceObjs = getSourceObjects(x, rope, obj);

      for ( FObject sourceObj : sourceObjs ) {
        if ( nextRelationships.contains("__terminates__") ) {
          if ( sourceObj instanceof User && ((User) sourceObj).getId() == user_.getId() ) return true;
          else continue;
        }
        for ( String nextRelationship : nextRelationships ) {
          if ( ropeSearch(x, sourceObj, rope.getSourceDAOKey(), "", nextRelationship, "") ) return true;
        }
      }
    }

    return false; 
  }

  // get the next relationship keys pointed to by a key
  public List<String> getNextRelationships(ROPE rope, String relationshipKey, String crudKey, String propertyKey) {
    // if this is the first step in the search, check the crudMap for a list of next steps
    List<String> next = new ArrayList<String>();
    if ( crudKey != null && ! crudKey.equals("") ) {
      Map<String, List<String>> crudMap = rope.getCrudMap() == null ? null : rope.getCrudMap().get(crudKey);
      if ( propertyKey != null && ! propertyKey.equals("") && crudMap.containsKey(propertyKey) ) {
        next = crudMap.get(propertyKey);
      }
      else {
        next = crudMap.get("__default__");
      }
    } else if ( relationshipKey != null && ! relationshipKey.equals("") ) {
      next = rope.getRelationshipMap() == null ? null : rope.getRelationshipMap().get(relationshipKey);
    } else {
      return null;
    }

    return next;
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
        FObject sourceObj = (FObject) (((DAO) x.get(relationship.getTargetDAOKey()))
                    .find(((Long)retrieveProperty(junctionObj, "get", "sourceId")).longValue()));
        sourceObjs.add(sourceObj);
    }

    } else if ( rope.getCardinality().equals("1:*") && rope.getIsInverse() ) {
      DAO rDAO = retrieveProperty(obj, "get", rope.getRelationshipKey(), x);
      sourceObjs = ((ArraySink) rDAO.where(INSTANCE_OF(((DAO) x.get(rope.getSourceDAOKey())).getOf())).select(new ArraySink())).getArray();
    } else if (rope.getCardinality().equals("1:*") ) {
      FObject sourceObj = retrieveProperty(obj, "find", rope.getRelationshipKey(), x);
      sourceObjs.add(sourceObj);
    } 

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

  public List<String> getPropertyUpdates(FObject oldObj, FObject obj) {
    if ( oldObj == null ) oldObj = (obj.getClass()).newInstance();
    Map diff = oldObj.diff(obj);
    Iterator i = diff.keySet().iterator();

    List<String> propertyUpdates = new ArrayList<String>();
    while ( i.hasNext() ) {
      String key = (String) i.next();
      PropertyInfo prop = (PropertyInfo) oldObj.getClassInfo().getAxiomByName(key);
      propertyUpdates.add(new foam.dao.history.PropertyUpdate(key, prop.f(oldObj), diff.get(key)).getName());
    }
    return propertyUpdates;
  }

  public void authorizeOnCreate(X x, FObject obj) throws AuthorizationException {

    List<String> propertiesUpdated = getPropertyUpdates(null, obj);
    for ( String property : propertiesUpdated ) {
      if ( ! ropeSearch(x, obj, targetDAOKey_, "create", "", property ) ) {
        throw new AuthorizationException("You don't have permission to create this object");
      }
    }
  }

  public void authorizeOnRead(X x, FObject obj) throws AuthorizationException {
    if ( ! ropeSearch(x, obj, targetDAOKey_, "read", "", "") ) throw new AuthorizationException("You don't have permission to read this object");
  }

  public void authorizeOnUpdate(X x, FObject oldObj, FObject obj) throws AuthorizationException {
    List<String> propertiesUpdated = getPropertyUpdates(oldObj, obj);
    for ( String property : propertiesUpdated ) {
      if ( ! ropeSearch(x, obj, targetDAOKey_, "update", "", property ) ) {
        throw new AuthorizationException("You don't have permission to update this object");
      }
    }
  }

  public void authorizeOnDelete(X x, FObject obj) throws AuthorizationException {
    if ( ! ropeSearch(x, obj, targetDAOKey_, "delete", "", "") ) throw new AuthorizationException("You don't have permission to delete this object");
  }

  public boolean checkGlobalRead(X x) {
    return false;
  }

  public boolean checkGlobalRemove(X x) {
    return false;
  }

  public String getPermissionPrefix() {
    return "";
  }

}