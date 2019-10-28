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
import java.lang.*;
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
import foam.nanos.rope.*;
import foam.nanos.auth.User;

public class ROPEAuthorizer implements Authorizer {

  DAO ropeDAO_;
  protected String targetDAOKey_;

  public ROPEAuthorizer(X x, String targetDAOKey) {
    targetDAOKey_ = targetDAOKey;
  }

//relationship = current, relationshipkey = previous
  public boolean ropeSearch(X x, FObject obj, String targetDAOKey, String relationship, String crudKey, String relationshipKey, String propertyKey) {
    if ( ropeDAO_ == null ) ropeDAO_ = (DAO) x.get("ropeDAO");
    System.out.println("!!");

    System.out.println("\nropeSearch( x, " + obj.getClass() + "+" + retrieveProperty(obj, obj.getClass(), "get", "id")+ ", "+targetDAOKey+", " + relationship + ", "+crudKey + ", " + relationshipKey + ", " + propertyKey +" )");
    // System.out.println(((ArraySink) ropeDAO_.select(new ArraySink())).getArray());

    // get all the ropes associated with the targetDAO
    DAO filteredRopeDAO = (DAO) ropeDAO_.where(AND(EQ(ROPE.TARGET_DAOKEY, targetDAOKey)));

    // if there is a relationship key to search for, filter the ropedao based on relationshipKey
    if ( ! relationship.isEmpty() ) {
      filteredRopeDAO = (DAO) filteredRopeDAO.where(EQ(ROPE.RELATIONSHIP_KEY, relationship));
    }

    List<ROPE> ropes = (List<ROPE>) ((ArraySink) filteredRopeDAO.select(new ArraySink())).getArray();
    System.out.println("found " + ropes.size() + " ropes.");

    // check each rope
    for ( ROPE rope : ropes ) {

      // move rope check into rope model in method called check 
      System.out.println("ROPE: " + rope);
      if ( rope instanceof AndROPE ) {
        List<ROPE> compositeRopes = ((AndROPE) rope).getCompositeRopes();
        boolean andRopes = ( compositeRopes != null || compositeRopes.size() > 0 ) ? true : false;
        for ( ROPE subRope : compositeRopes ) {
          if ( ! checkRope(x, obj, subRope, relationshipKey, crudKey, propertyKey) ) {
            andRopes = false;
            break;
          }
        } 
        if ( andRopes ) return true;
      } else if (rope instanceof OrROPE) {
        List<ROPE> compositeRopes = ((OrROPE) rope).getCompositeRopes();
        for ( ROPE subRope : compositeRopes ) {
          if ( checkRope(x, obj, subRope, relationshipKey, crudKey, propertyKey) ) return true;
        }
      } else {
        if ( checkRope(x, obj, rope, relationshipKey, crudKey, propertyKey) ) return true;
      }




      // // get the list of next relationships to search to pass this rope
      // List<String> nextRelationships = getNextRelationships(rope, relationshipKey, crudKey, propertyKey);
      // System.out.println("nextRelationships = " + nextRelationships);

      // // if a there are no results, continue to the next rope
      // if ( nextRelationships == null || nextRelationships.size() == 0 ) continue;

      // // get the list of sourceObjs that have a relationship with the largetObj
      // List<FObject> sourceObjs = getSourceObjects(x, rope, obj);
      // System.out.println("SOURCEOBJ");
      // for ( FObject sourceObj : sourceObjs ) {
      //   if (sourceObj == null )System.out.println("null");
      // else System.out.println("class = "+sourceObj.getClass() + ", objId = "+retrieveProperty(sourceObj, sourceObj.getClass(), "get", "id"));
      // }

      // for ( FObject sourceObj : sourceObjs ) {
      //   if ( sourceObj == null ) continue;
      //   if ( nextRelationships.contains("__terminate__") ) {
      //     System.out.println("\n\nTERMINATING\n\n");
      //     if ( sourceObj instanceof User && ((User) sourceObj).getId() == ((User) x.get("user")).getId() ) return true;
      //     else continue;
      //   }
      //   for ( String nextRelationship : nextRelationships ) {
      //     if ( ropeSearch(x, sourceObj, rope.getSourceDAOKey(), nextRelationship, "", rope.getRelationshipKey(), "") ) return true;
      //   }
      // }
    }

    return false; 
  }

  // ropeSearch(X x, FObject obj, String targetDAOKey, String relationship, String crudKey, String relationshipKey, String propertyKey)
  public boolean checkRope(X x, FObject obj, ROPE rope, String relationshipKey, String crudKey, String propertyKey) {

    // get the list of next relationships to search to pass this rope
    List<String> nextRelationships = getNextRelationships(rope, relationshipKey, crudKey, propertyKey);
    System.out.println("nextRelationships = " + nextRelationships);

    // if a there are no results, continue to the next rope
    if ( nextRelationships == null || nextRelationships.size() == 0 ) return false;

    // get the list of sourceObjs that have a relationship with the largetObj
    List<FObject> sourceObjs = getSourceObjects(x, rope, obj);
    System.out.println("SOURCEOBJ");
    for ( FObject sourceObj : sourceObjs ) {
      if (sourceObj == null )System.out.println("null");
    else System.out.println("class = "+sourceObj.getClass() + ", objId = "+retrieveProperty(sourceObj, sourceObj.getClass(), "get", "id"));
    }

    for ( FObject sourceObj : sourceObjs ) {
      if ( sourceObj == null ) continue;
      if ( nextRelationships.contains("__terminate__") ) {
        System.out.println("\n\nTERMINATING\n\n");
        if ( sourceObj instanceof User && ((User) sourceObj).getId() == ((User) x.get("user")).getId() ) return true;
        else continue;
      }
      for ( String nextRelationship : nextRelationships ) {
        if ( ropeSearch(x, sourceObj, rope.getSourceDAOKey(), nextRelationship, "", rope.getRelationshipKey(), "") ) return true;
      }
    }

    return false;

  }

  // get the next relationship keys pointed to by a key
  public List<String> getNextRelationships(ROPE rope, String relationshipKey, String crudKey, String propertyKey) {
    System.out.println("!!");
    // if this is the first step in the search, check the crudMap for a list of next steps
    List<String> next = new ArrayList<String>();
    if ( crudKey != null && ! crudKey.equals("") ) {
      Map<String, List<String>> crudMap = rope.getCrudMap() == null ? null : rope.getCrudMap().get(crudKey);
      if ( propertyKey != null && ! propertyKey.equals("") && crudMap.containsKey(propertyKey) ) {
        next = crudMap.get(propertyKey);
      } else {
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
      String targetPropertyName = rope.getIsInverse() ? "sourceId" : "targetId";
      String sourcePropertyName = rope.getIsInverse() ? "targetId" : "sourceId";

      foam.dao.ManyToManyRelationshipImpl relationship = (foam.dao.ManyToManyRelationshipImpl) retrieveProperty(obj, obj.getClass(), "get", rope.getRelationshipKey(), x);
      List<FObject> junctionObjs = (List<FObject>) ( (ArraySink) relationship.getJunctionDAO().where(
        EQ(relationship.getJunction().getAxiomByName(targetPropertyName), (Long) retrieveProperty(obj, obj.getClass(), "get", "id"))
      )
      .select(new ArraySink()))
      .getArray();

      for ( FObject junctionObj : junctionObjs ) {
        FObject sourceObj = (FObject) (((DAO) x.get(rope.getSourceDAOKey()))
                    .find(((Long)retrieveProperty(junctionObj, junctionObj.getClass(), "get", sourcePropertyName)).longValue()));
        sourceObjs.add(sourceObj);
    }

    } else if ( rope.getCardinality().equals("1:*") && rope.getIsInverse() ) {
      DAO rDAO = retrieveProperty(obj, obj.getClass(), "get", rope.getRelationshipKey(), x);
      sourceObjs = ((ArraySink) rDAO.where(INSTANCE_OF(((DAO) x.get(rope.getSourceDAOKey())).getOf())).select(new ArraySink())).getArray();
    } else if (rope.getCardinality().equals("1:*") ) {
      FObject sourceObj = retrieveProperty(obj, obj.getClass(), "find", rope.getRelationshipKey(), x);
      sourceObjs.add(sourceObj);
    } else if ( rope.getCardinality().equals("1:1") ) {
      String propName = rope.getRelationshipKey().substring(rope.getRelationshipKey().lastIndexOf(".") + 1);
      DAO sourceDAO = (DAO) x.get(rope.getSourceDAOKey());
      sourceObjs.add(sourceDAO.find(retrieveProperty(obj, obj.getClass(), "get", propName)));
    }

    return sourceObjs;
  }

  public <T> T retrieveProperty(FObject obj, Class objClass, String prefix, String propertyName, X... x) {
    if ( objClass == null ) objClass = obj.getClass();
    // System.out.println("retrieveProperty( obj, " + objClass.getName() + ", "+prefix+", "+propertyName+" )");
    Method method;
    try {
      method = x.length > 0 ? 
        objClass.getDeclaredMethod(
          prefix + 
          propertyName.substring(0, 1).toUpperCase() + 
          propertyName.substring(1),
          X.class
        ) :
        objClass.getDeclaredMethod(
          prefix + 
          propertyName.substring(0, 1).toUpperCase() + 
          propertyName.substring(1)
        );
        method.setAccessible(true);

        T ret = x.length > 0 ? (T) method.invoke((FObject) obj, x[0]) : (T) method.invoke((FObject) obj);
        return ret;
    } catch (NoSuchMethodException | SecurityException | IllegalAccessException | IllegalArgumentException
            | InvocationTargetException e) {
        if ( ((Class) objClass).getSuperclass() != null ) return retrieveProperty(obj, ((Class) objClass).getSuperclass(), prefix, propertyName, x);
        System.err.println("ROPE ERROR: Attempted access on non-existant property ");
        e.printStackTrace();
    } 
    return null;
  }

  public List<String> getPropertyUpdates(FObject oldObj, FObject obj) {
    System.out.println("!!");
    try {
      if ( oldObj == null ) oldObj = (obj.getClass()).newInstance();
    } catch ( Exception e ) {
      e.printStackTrace();
    }
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
    System.out.println("authorizeOnCreate : userId = " + ((User) x.get("user")).getId());
    if ( ((User) x.get("user")).getId() == User.SYSTEM_USER_ID ) return;

    List<String> propertiesUpdated = getPropertyUpdates(null, obj);
    System.out.println(propertiesUpdated);
    for ( String property : propertiesUpdated ) {
      if ( ! ropeSearch(x, obj, targetDAOKey_, "", "create", "", property ) ) {
        throw new AuthorizationException("You don't have permission to create this object");
      }
    }
  }

  public void authorizeOnRead(X x, FObject obj) throws AuthorizationException {
    System.out.println("authorizeOnRead : userId = " + ((User) x.get("user")).getId());
    if ( ((User) x.get("user")).getId() == User.SYSTEM_USER_ID ) return;
    if ( ! ropeSearch(x, obj, targetDAOKey_, "", "read", "", "") ) throw new AuthorizationException("You don't have permission to read this object");
  }

  public void authorizeOnUpdate(X x, FObject oldObj, FObject obj) throws AuthorizationException {
    System.out.println("authorizeOnUpdate : userId = " + ((User) x.get("user")).getId());
    if ( ((User) x.get("user")).getId() == User.SYSTEM_USER_ID ) return;
    List<String> propertiesUpdated = getPropertyUpdates(oldObj, obj);
    for ( String property : propertiesUpdated ) {
      if ( ! ropeSearch(x, obj, targetDAOKey_, "", "update", "", property ) ) {
        throw new AuthorizationException("You don't have permission to update this object");
      }
    }
  }

  public void authorizeOnDelete(X x, FObject obj) throws AuthorizationException {
    System.out.println("authorizeOnDelete : userId = " + ((User) x.get("user")).getId());
    if ( ((User) x.get("user")).getId() == User.SYSTEM_USER_ID ) return;
    if ( ! ropeSearch(x, obj, targetDAOKey_, "", "delete", "", "") ) throw new AuthorizationException("You don't have permission to delete this object");
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