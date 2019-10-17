// /**
//  * @license
//  * Copyright 2019 The FOAM Authors. All Rights Reserved.
//  * http://www.apache.org/licenses/LICENSE-2.0
//  */

// package foam.nanos.rope.test;

// import foam.core.FObject;
// import foam.core.X;
// import foam.dao.ArraySink;
// import foam.dao.DAO;
// import foam.nanos.auth.AuthorizationException;
// import foam.nanos.auth.Authorizer;
// import foam.nanos.rope.*;
// import java.lang.reflect.*;
// import java.util.ArrayList;
// import java.util.List;
// import java.util.HashMap;
// import java.util.Map;
// import java.util.Arrays;
// import static foam.mlang.MLang.*;

// // rope authorizer to be used for testobj such as ROPEUser
// public class TestRopeAuthorizer implements Authorizer {

//   protected ROPEUser user_;
//   protected DAO ropeDAO_;
//   protected String targetDAOKey_;
//   protected Map<FObject, List<ROPE>> seen;

//   public TestRopeAuthorizer(X x, ROPEUser user, String targetDAOKey) {
//     user_ = user;
//     ropeDAO_ = (DAO) x.get("ropeDAO");
//     targetDAOKey_ = targetDAOKey;
//     seen = new HashMap<FObject, List<ROPE>>();
//   }

//   // public List<List<ROPE>> getRopes(FObject obj, String targetDAOKey, ROPEActions operation, X x, List<List<ROPE>> ) {

//   // }

//   public boolean ropeSearch(ROPEActions operation, FObject obj, X x, String targetDAOKey) {
//     Long id = (Long) retrieveProperty(obj, "get", "id");
//     System.out.println("\n\n\nropeSearch("+operation+", {"+obj.getClassInfo().getId()+", "+id+"}, "+targetDAOKey+")");
//     System.out.println("-----------------------------------------------------------------------------------------------------------------------------");
//     if ( obj != null && obj instanceof ROPEUser && ((ROPEUser) obj).getId() == user_.getId() && operation == ROPEActions.OWN ) {
//       System.out.println("> targetObject is SELF and targetDAOKey is OWN. Authorization Granted.");
//       System.out.println("> End of ropeSearch.");
//       return true;
//     }

//     List<ROPE> ropes = (List<ROPE>) ((ArraySink) this.ropeDAO_
//       .where(AND(
//         EQ(ROPE.TARGET_MODEL, obj.getClassInfo()),
//         EQ(ROPE.TARGET_DAOKEY, targetDAOKey)
//       )) 
//       .select(new ArraySink()))
//       .getArray();

//     System.out.println("> "+ropes.size() + " ROPEs found.");

//     for ( ROPE rope : ropes ) {
//       System.out.println("------------------------------------------------- ROPE INFO -----------------------------------------------------------------\nrope = { sourceDAOKey = "+rope.getSourceDAOKey() + ", targetDAOKey = "+rope.getTargetDAOKey() + ", junctionDAOKey = "+rope.getJunctionDAOKey()+", isInverse = "+rope.getIsInverse()+", inverseName = "+rope.getInverseName()+" }");

//       if (seen.containsKey(obj) && seen.get(obj).contains(rope)) {
//         if (seen.get(obj).contains(rope)) {
//           System.out.println("> ROPE has already been SEEN for target object, skipping to next rope");
//           continue;
//         }
//         else {
//           // List list = seen.get(obj);
//           // list.add(rope);
//           // seen.put(obj, list);
//           seen.get(obj).add(rope);
//         }
//       }
//       else seen.put(obj, new ArrayList<ROPE>(Arrays.asList(rope)));

//       // todo ruby
//       List<ROPEActions> actions = rope.getCRUD() == null ? null : rope.getCRUD().get(operation);
//       if ( rope.getCRUD() == null || actions == null || actions.size() == 0 ) {
//         System.out.println("> ROPE does not grant desired targetAction, continue to next rope");
//         continue;
//       }

//       List<FObject> sourceObjs = getSourceObjects(x, rope, obj);


//       if(rope.getCRUD()!=null)System.out.println("> CRUD = " + rope.getCRUD());

//       if ( actions != null && actions.size() > 0 ) {

//         for ( FObject sourceObj : sourceObjs ) {
//           for ( ROPEActions action : actions ) {
//             if ( ropeSearch(action, sourceObj, x, rope.getSourceDAOKey()) ) return true;
//           }
//         }
//       }

//       System.out.println("-----------------------------------------------------------------------------------------------------------------------------");
//     }

//     return false; 
//   }

//   public List<FObject> getSourceObjects(X x, ROPE rope, FObject obj) {
//     DAO junctionDAO = (DAO) x.get(rope.getJunctionDAOKey());
//     DAO sourceDAO = (DAO) x.get(rope.getSourceDAOKey());
//     List<FObject> sourceObjs = new ArrayList(); 

//     if ( rope.getCardinality().equals("*:*") ) {

//       Object predicateProperty = rope.getIsInverse() ? rope.getJunctionModel().getAxiomByName("sourceId") : rope.getJunctionModel().getAxiomByName("targetId");
//       List<FObject> junctionObjs = ((ArraySink) junctionDAO
//         .where(
//           EQ(predicateProperty, (Long) retrieveProperty(obj, "get", "id"))
//         )
//         .select(new ArraySink()))
//         .getArray();

//       for ( FObject junctionObj : junctionObjs ) {
//         FObject sourceObj = rope.getIsInverse() ? (FObject) sourceDAO.find(((Long)retrieveProperty(junctionObj, "get", "targetId")).longValue()) : (FObject) sourceDAO.find(((Long)retrieveProperty(junctionObj, "get", "sourceId")).longValue());
//         sourceObjs.add(sourceObj);
//       }
//     } else if ( rope.getCardinality().equals("*:1") ) {
//       DAO rDAO = retrieveProperty(obj, "get", rope.getInverseName(), x);
//       sourceObjs = ((ArraySink) rDAO.where(INSTANCE_OF(rope.getSourceModel().getObjClass())).select(new ArraySink())).getArray();
//     } else if (rope.getCardinality().equals("1:*") ) {
//       FObject sourceObj = retrieveProperty(obj, "find", rope.getInverseName(), x);
//       sourceObjs.add(sourceObj);
//     } else return sourceObjs;

//     String str = "> SOURCEOBJS : { ";
//     for(FObject srcobj : sourceObjs) {
//       Long objid = (Long) retrieveProperty(srcobj, "get", "id");
//       str += objid + ",";
//     }
//     str = str.substring(0, str.length() - 1);
//     str += " }";
//     System.out.println(str);
    
//     return sourceObjs;
//   }

//   public <T> T retrieveProperty(FObject obj, String prefix, String propertyName, X... x) {
//     Method method;
//     try {
//       method = x.length > 0 ? 
//         obj.getClass().getDeclaredMethod(
//           prefix + 
//           propertyName.substring(0, 1).toUpperCase() + 
//           propertyName.substring(1),
//           X.class
//         ) :
//         obj.getClass().getDeclaredMethod(
//           prefix + 
//           propertyName.substring(0, 1).toUpperCase() + 
//           propertyName.substring(1)
//         );
//         method.setAccessible(true);

//         T ret = x.length > 0 ? (T) method.invoke((FObject) obj, x[0]) : (T) method.invoke((FObject) obj);
//         return ret;
//     } catch (NoSuchMethodException | SecurityException | IllegalAccessException | IllegalArgumentException
//             | InvocationTargetException e) {
//         System.err.println("ROPE ERROR: Attempted access on non-existant property ");
//         e.printStackTrace();
//     } 
//     return null;
//   }




//   public void authorizeOnCreate(X x, FObject obj) throws AuthorizationException {
//     if ( ! ropeSearch(ROPEActions.C, obj, x, targetDAOKey_) ) throw new AuthorizationException("You don't have permission to create this object");
//   }

//   public void authorizeOnRead(X x, FObject obj) throws AuthorizationException {
//     if ( ! ropeSearch(ROPEActions.R, obj, x, targetDAOKey_) ) throw new AuthorizationException("You don't have permission to create this object");
//   }

//   public void authorizeOnUpdate(X x, FObject oldObj, FObject obj) throws AuthorizationException {
//     if ( ! ropeSearch(ROPEActions.U, obj, x, targetDAOKey_) ) throw new AuthorizationException("You don't have permission to create this object");
//   }

//   public void authorizeOnDelete(X x, FObject obj) throws AuthorizationException {
//     if ( ! ropeSearch(ROPEActions.D, obj, x, targetDAOKey_) ) throw new AuthorizationException("You don't have permission to create this object");
//   }

//   public boolean checkGlobalRead(X x) {
//     return false;
//   }

//   public boolean checkGlobalRemove(X x) {
//     return false;
//   }

// }