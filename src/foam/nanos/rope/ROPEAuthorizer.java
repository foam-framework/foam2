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
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import foam.core.PropertyInfo;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.history.PropertyUpdate;
import foam.nanos.auth.User;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.Authorizer;
import foam.nanos.rope.ROPE;

public class ROPEAuthorizer implements Authorizer {

  protected User user_;
  protected DAO ropeDAO_;
  protected String targetDAOKey_;

  public ROPEAuthorizer(X x, String targetDAOKey) {
    user_ = (User) x.get("user");
    ropeDAO_ = (DAO) x.get("ropeDAO");
    targetDAOKey_ = targetDAOKey;
  }

  public boolean ropeSearch(X x, FObject obj, String targetDAOKey, String crudKey, String relationshipKey, List<PropertyUpdate> diff) {

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
      List<String> nextRelationships = getNextRelationships(relationshipKey, crudKey, diff);

      // if a there are no results, continue to the next rope
      if ( nextRelationships == null || nextRelationships.size() == 0 ) continue;

      // get the list of sourceObjs that have a relationship with the largetObj
      List<FObject> sourceObjs = getSourceObjects(x, rope, obj);

      for ( FObject sourceObj : sourceObjs ) {
        if ( nextRelationships.contains("__terminates__") ) {
          if ( sourceObj instanceof User && sourceObj.getId() == user_.getId() ) return true;
          else continue;
        }
        for ( String nextRelationship : nextRelationships ) {
          if ( ropeSearch(x, sourceObj, rope.getSourceDAOKey(), "", nextRelationship) ) return true;
        }
      }
    }

    return false; 
  }

  public List<String> getNextRelationships(String relationshipKey, String crudKey, List<PropertyUpdate> diff) {
    // if this is the first step in the search, check the crudMap for a list of next steps
    List<String> next = new ArrayList<String>();
    if ( crudKey != null && ! crudKey.equals("") ) {
      Map<String, List<String>> crudMap = rope.getCrudMap() == null ? null : rope.getCrudMap().get(crudKey);
      
      if ( diff != null && diff.size() > 0 ) {
        for ( PropertyUpdate prop : diff ) {
          if ( crudMap.containsKey(prop.getName()) ) {
            next.addAll(crudMap.get(prop.getName()));
          } 
        } 
      }
      next.addAll(crudMap.get("__default__"));
      
      // remove duplicates
      next = next.stream().distinct().collect(Collectors.toList());

    } else if (relationshipKey != null && ! relationshipKey.equals("")) {
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

    } else if ( rope.getCardinality().equals("*:1") ) {
      DAO rDAO = retrieveProperty(obj, "get", rope.getRelationshipKey(), x);
      sourceObjs = ((ArraySink) rDAO.where(INSTANCE_OF(rope.getSourceModel().getObjClass())).select(new ArraySink())).getArray();
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

  public List<foam.dao.history.PropertyUpdate> getPropertyUpdates(FObject oldObj, FObject obj) {
    Map diff = oldObj.diff(obj);
    Iterator i = diff.keySet().iterator();

    int i = 0;
    List<foam.dao.history.PropertyUpdate> propertyUpdates = new ArrayList<foam.dao.history.PropertyUpdate>();
    while ( i.hasNext() ) {
      String key = (String) i.next();
      PropertyInfo prop = (PropertyInfo) oldObj.getClassInfo().getAxiomByName(key);
      propertyUpdates.add(new foam.dao.history.PropertyUpdate(key, prop.f(oldObj), diff.get(key)));
    }
    return propertyUpdates;
  }

  public void authorizeOnCreate(X x, FObject obj) throws AuthorizationException {
    if ( ! ropeSearch(x, obj, targetDAOKey_, "create", "", null) ) throw new AuthorizationException("You don't have permission to create this object");
  }

  public void authorizeOnRead(X x, FObject obj) throws AuthorizationException {
    if ( ! ropeSearch(x, obj, targetDAOKey_, "read", "", null) ) throw new AuthorizationException("You don't have permission to read this object");
  }

  public void authorizeOnUpdate(X x, FObject oldObj, FObject obj) throws AuthorizationException {
    if ( ! ropeSearch(x, obj, targetDAOKey_, "update", "", getPropertyUpdates(oldObj, obj)) ) throw new AuthorizationException("You don't have permission to update this object");
  }

  public void authorizeOnDelete(X x, FObject obj) throws AuthorizationException {
    if ( ! ropeSearch(x, obj, targetDAOKey_, "delete", "", null) ) throw new AuthorizationException("You don't have permission to delete this object");
  }

  public boolean checkGlobalRead(X x) {
    return false;
  }

  public boolean checkGlobalRemove(X x) {
    return false;
  }

}