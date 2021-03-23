/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.crunch.crunchtest;

import foam.core.*;
import foam.dao.*;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.*;
import foam.nanos.crunch.*;
import java.util.*;
import net.nanopay.crunch.*;
import static foam.mlang.MLang.*;
import static foam.nanos.crunch.CapabilityJunctionStatus.*;

public class PredicatedPCJDAOTest extends foam.nanos.test.Test {

  DAO capabilityDAO, userCapabilityJunctionDAO, prerequisiteCapabilityJunctionDAO, userDAO;
  User nanoUser, nanoAdmin;
  X testX, nanoX, adminX;
  Capability cap, prereq, testPrereq, nanoPrereq;

  public void runTest(X x) {
    capabilityDAO = (DAO) x.get("capabilityDAO");
    userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
    prerequisiteCapabilityJunctionDAO = (DAO) x.get("prerequisiteCapabilityJunctionDAO");
    userDAO = (DAO) x.get("localUserDAO");

    nanoUser = new User.Builder(x).setId(101L).setSpid("nanopay").setEmail("user@nano.pay").setGroup("basicUser").setFirstName("user").setLastName("nano").build();
    nanoAdmin = new User.Builder(x).setId(1234L).setSpid("nanopay").setEmail("admin@nano.pay").setGroup("admin").setFirstName("admin").setLastName("nano").build();
    nanoUser = (User) userDAO.put(nanoUser);
    nanoAdmin = (User) userDAO.put(nanoAdmin);
    nanoX = x.put("subject", new Subject(nanoUser));
    adminX = x.put("subject", new Subject(nanoAdmin));

    Predicate isTestSpid = new IsSpid.Builder(x).setSpid("test").build();
    Predicate isNanoSpid = new IsSpid.Builder(x).setSpid("nanopay").build();

    cap = new Capability.Builder(x).setId("cap").build();
    prereq = new Capability.Builder(x).setId("prereq").build();
    testPrereq = new Capability.Builder(x).setId("testPrereq").build();
    nanoPrereq = new Capability.Builder(x).setId("nanoPrereq").build();
    cap = (Capability) capabilityDAO.put(cap);
    prereq = (Capability) capabilityDAO.put(prereq);
    testPrereq = (Capability) capabilityDAO.put(testPrereq);
    nanoPrereq = (Capability) capabilityDAO.put(nanoPrereq);
    
    CapabilityCapabilityJunction capToPrereq = new CapabilityCapabilityJunction.Builder(x)
      .setSourceId("cap")
      .setTargetId("prereq")
      .build();
    CapabilityCapabilityJunction capToTestPrereq = new CapabilityCapabilityJunction.Builder(x)
      .setSourceId("cap")
      .setTargetId("testPrereq")
      .setPredicate(isTestSpid)
      .build();
    CapabilityCapabilityJunction capToNanoPrereq = new CapabilityCapabilityJunction.Builder(x)
      .setSourceId("cap")
      .setTargetId("nanoPrereq")
      .setPredicate(isNanoSpid)
      .build();
    prerequisiteCapabilityJunctionDAO.put(capToPrereq);
    prerequisiteCapabilityJunctionDAO.put(capToTestPrereq);
    prerequisiteCapabilityJunctionDAO.put(capToNanoPrereq);

    testPredicatedCCJFind();
    testPredicatedCCJSelect();
    testUserUCJGranting(x);

  }

  public void testPredicatedCCJFind() {
    // test nanoUser access
    CapabilityCapabilityJunction nanoFindCTP = (CapabilityCapabilityJunction) prerequisiteCapabilityJunctionDAO.inX(nanoX).find(AND(
      EQ(CapabilityCapabilityJunction.SOURCE_ID, "cap"),
      EQ(CapabilityCapabilityJunction.TARGET_ID, "prereq")));
    CapabilityCapabilityJunction nanoFindCTTP = (CapabilityCapabilityJunction) prerequisiteCapabilityJunctionDAO.inX(nanoX).find(AND(
      EQ(CapabilityCapabilityJunction.SOURCE_ID, "cap"),
      EQ(CapabilityCapabilityJunction.TARGET_ID, "testPrereq")));
    CapabilityCapabilityJunction nanoFindCTNP = (CapabilityCapabilityJunction) prerequisiteCapabilityJunctionDAO.inX(nanoX).find(AND(
      EQ(CapabilityCapabilityJunction.SOURCE_ID, "cap"),
      EQ(CapabilityCapabilityJunction.TARGET_ID, "nanoPrereq")));
    test(nanoFindCTP != null, "nanoUser can see ccj[cap, prereq]");
    test(nanoFindCTTP == null, "nanoUser cannot see ccj[cap, testPrereq]");
    test(nanoFindCTNP != null, "nanoUser can see ccj[cap, nanoPrereq]");
    // test nanoAdmin access
    CapabilityCapabilityJunction adminFindCTP = (CapabilityCapabilityJunction) prerequisiteCapabilityJunctionDAO.inX(adminX).find(AND(
      EQ(CapabilityCapabilityJunction.SOURCE_ID, "cap"),
      EQ(CapabilityCapabilityJunction.TARGET_ID, "prereq")));
    CapabilityCapabilityJunction adminFindCTTP = (CapabilityCapabilityJunction) prerequisiteCapabilityJunctionDAO.inX(adminX).find(AND(
      EQ(CapabilityCapabilityJunction.SOURCE_ID, "cap"),
      EQ(CapabilityCapabilityJunction.TARGET_ID, "testPrereq")));
    CapabilityCapabilityJunction adminFindCTNP = (CapabilityCapabilityJunction) prerequisiteCapabilityJunctionDAO.inX(adminX).find(AND(
      EQ(CapabilityCapabilityJunction.SOURCE_ID, "cap"),
      EQ(CapabilityCapabilityJunction.TARGET_ID, "nanoPrereq")));
    test(adminFindCTP != null, "nanoAdmin can see ccj[cap, prereq]");
    test(adminFindCTTP != null, "nanoAdmin can see ccj[cap, testPrereq]");
    test(adminFindCTNP != null, "nanoAdmin can see ccj[cap, nanoPrereq]");
  }

  public void testPredicatedCCJSelect() {
    // test nanoUser access
    List<CapabilityCapabilityJunction> nanoSelect = ((ArraySink) prerequisiteCapabilityJunctionDAO.inX(nanoX).where(EQ(CapabilityCapabilityJunction.SOURCE_ID, "cap")).select(new ArraySink())).getArray();
    test(nanoSelect.size() == 2, "nanoUser select yields 2 prereqs: " + nanoSelect);
    // test admin access
    List<CapabilityCapabilityJunction> adminSelect = ((ArraySink) prerequisiteCapabilityJunctionDAO.inX(adminX).where(EQ(CapabilityCapabilityJunction.SOURCE_ID, "cap")).select(new ArraySink())).getArray();
    test(adminSelect.size() == 3, "nanoAdmin select yields 3 prereqs: " + adminSelect);
  }

  public void testUserUCJGranting(X x) {
    // part 1 - test non-admin user - "cap" should become granted for user as long as the user has been granted all the prerequisites 
    // they can see, i.e., nanoPrereq
    UserCapabilityJunction n_ucjP = new UserCapabilityJunction.Builder(x).setSourceId(nanoUser.getId()).setTargetId(prereq.getId()).build();
    UserCapabilityJunction n_ucjTP = new UserCapabilityJunction.Builder(x).setSourceId(nanoUser.getId()).setTargetId(testPrereq.getId()).build();
    UserCapabilityJunction n_ucjNP = new UserCapabilityJunction.Builder(x).setSourceId(nanoUser.getId()).setTargetId(nanoPrereq.getId()).build();
    UserCapabilityJunction n_ucjC = new UserCapabilityJunction.Builder(x).setSourceId(nanoUser.getId()).setTargetId(cap.getId()).build();
    n_ucjP = (UserCapabilityJunction) userCapabilityJunctionDAO.inX(nanoX).put(n_ucjP);
    n_ucjTP = (UserCapabilityJunction) userCapabilityJunctionDAO.inX(nanoX).put(n_ucjTP);
    n_ucjC = (UserCapabilityJunction) userCapabilityJunctionDAO.inX(nanoX).put(n_ucjC); 
    // Testing when all prerequisites of "cap" are granted except for the capability satisfied by 
    // the capabilityCapabilityPredicate (user.isSpid=nanopay) between capability "cap" and capability "nanoPrereq".
    // Results in "cap" not being GRANTED.
    test(n_ucjP.getStatus() == GRANTED, "prereq is granted for testUser: " + n_ucjP.getStatus());
    test(n_ucjTP.getStatus() == GRANTED, "testPrereq is granted for testUser: " + n_ucjTP.getStatus());
    test(n_ucjC.getStatus() != GRANTED, "cap is not granted for testUser: " + n_ucjC.getStatus());

    // After adding the missing prerequisite, test if "cap" becomes granted
    n_ucjNP = (UserCapabilityJunction) userCapabilityJunctionDAO.inX(nanoX).put(n_ucjNP);
    test(n_ucjNP.getStatus() == GRANTED, "nanoPrereq is granted for testUser: " + n_ucjNP.getStatus());
    n_ucjC = (UserCapabilityJunction) userCapabilityJunctionDAO.inX(nanoX).find(AND(EQ(UserCapabilityJunction.SOURCE_ID, nanoUser.getId()), EQ(UserCapabilityJunction.TARGET_ID, "cap")));
    test(n_ucjC.getStatus() == GRANTED, "cap is granted for testUser: " + n_ucjC.getStatus());

    // part 2 - test admin user. Since admin users have permission to view all prerequisites, the top-level ucj "cap" will not become GRANTED until all prerequisites are GRANTED
    UserCapabilityJunction a_ucjP = new UserCapabilityJunction.Builder(x).setSourceId(nanoAdmin.getId()).setTargetId(prereq.getId()).build();
    UserCapabilityJunction a_ucjTP = new UserCapabilityJunction.Builder(x).setSourceId(nanoAdmin.getId()).setTargetId(testPrereq.getId()).build();
    UserCapabilityJunction a_ucjNP = new UserCapabilityJunction.Builder(x).setSourceId(nanoAdmin.getId()).setTargetId(nanoPrereq.getId()).build();
    UserCapabilityJunction a_ucjC = new UserCapabilityJunction.Builder(x).setSourceId(nanoAdmin.getId()).setTargetId(cap.getId()).build();
    // Testing when all prerequisites of "cap" are granted except for prerequisite where the predicate returns true for users in 'test' spid
    // if the ucj owner did not have permission "predicatedprerequisite.read.*",
    // this should satisfy the prerequiste requirement for "cap", but since admin users have the permission
    // the prerequisitejunction between cap and testPrereq is also available. 
    // Results in "cap" not being GRANTED until the testPrereq is GRANTED
    a_ucjNP = (UserCapabilityJunction) userCapabilityJunctionDAO.inX(adminX).put(a_ucjNP);
    a_ucjP = (UserCapabilityJunction) userCapabilityJunctionDAO.inX(adminX).put(a_ucjP);
    a_ucjC = (UserCapabilityJunction) userCapabilityJunctionDAO.inX(adminX).put(a_ucjC);
    test(a_ucjP.getStatus() == GRANTED, "prereq is granted for nanoAdmin: " + a_ucjP.getStatus());
    test(a_ucjNP.getStatus() == GRANTED, "nanoPrereq is granted for nanoAdmin: " + a_ucjNP.getStatus());
    a_ucjC = (UserCapabilityJunction) userCapabilityJunctionDAO.inX(adminX).find(AND(EQ(UserCapabilityJunction.SOURCE_ID, nanoAdmin.getId()), EQ(UserCapabilityJunction.TARGET_ID, "cap")));
    test(a_ucjC.getStatus() != GRANTED, "cap is not granted for nanoAdmin: " + a_ucjC.getStatus());

    // after granting "testPrereq" for admin user, "cap" becomes granted
    a_ucjTP = (UserCapabilityJunction) userCapabilityJunctionDAO.inX(adminX).put(a_ucjTP);
    test(a_ucjTP.getStatus() == GRANTED, "testPrereq is granted for nanoAdmin: " + a_ucjTP.getStatus());
    a_ucjC = (UserCapabilityJunction) userCapabilityJunctionDAO.inX(adminX).find(AND(EQ(UserCapabilityJunction.SOURCE_ID, nanoAdmin.getId()), EQ(UserCapabilityJunction.TARGET_ID, "cap")));
    test(a_ucjC.getStatus() == GRANTED, "cap is granted for nanoAdmin: " + a_ucjC.getStatus());
  }
}
