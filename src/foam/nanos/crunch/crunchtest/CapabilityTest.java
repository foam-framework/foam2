
/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.crunch.crunchtest;

import foam.core.*;
import foam.core.ContextAwareAgent;
import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.*;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.CapabilityAuthService;
import foam.nanos.auth.User;
import foam.nanos.crunch.Capability;
import foam.nanos.crunch.CapabilityCapabilityJunction;
import foam.nanos.crunch.CapabilityJunctionStatus;
import foam.nanos.crunch.crunchtest.FakeTestObject;
import foam.nanos.crunch.UserCapabilityJunction;
import foam.nanos.ruler.*;
import foam.nanos.test.Test;
import foam.test.TestUtils;
import java.security.Permission;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import static foam.mlang.MLang.*;

public class CapabilityTest extends Test {
  Capability c1, c2, c3, c4, c5, c6, c7, c8, c9;
  User u1;
  String p1, p2, p3, p4, p5;
  DAO userDAO, capabilityDAO, userCapabilityJunctionDAO, deprecatedCapabilityJunctionDAO, prerequisiteCapabilityJunctionDAO;
  UserCapabilityJunction ucJunction;
  CapabilityAuthService cas;
  CapabilityCapabilityJunction prereqJunction;

  public void runTest(X x) {
    x = TestUtils.mockDAO(x, "localUserDAO");
    x = TestUtils.mockDAO(x, "capabilityDAO");
    x = TestUtils.mockDAO(x, "deprecatedCapabilityJunctionDAO");
    x = TestUtils.mockDAO(x, "prerequisiteCapabilityJunctionDAO");
    DAO dao = new foam.nanos.crunch.UserCapabilityJunctionDAO.Builder(x).setDelegate(new MDAO(UserCapabilityJunction.getOwnClassInfo())).build();
    dao = new RulerDAO(x, dao, "userCapabilityJunctionDAO");
    x = x.put("userCapabilityJunctionDAO", dao);
    dao = new RulerDAO(x, (DAO) x.get("deprecatedCapabilityJunctionDAO"), "deprecatedCapabilityJunctionDAO");
    x = x.put("deprecatedCapabilityJunctionDAO", dao);
    
    userDAO = new RulerDAO(x, (DAO) x.get("localUserDAO"), "localUserDAO");
    // userDAO = (DAO) x.get("localUserDAO");
    capabilityDAO = (DAO) x.get("capabilityDAO");
    userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
    deprecatedCapabilityJunctionDAO = (DAO) x.get("deprecatedCapabilityJunctionDAO");
    prerequisiteCapabilityJunctionDAO = (DAO) x.get("prerequisiteCapabilityJunctionDAO");

    u1 = new User();
    u1.setFirstName("TestUser");
    u1.setId(88);
    userDAO.put_(x, u1);

    p1 = new String("p1");
    p2 = new String("p2");
    p3 = new String("p3");
    p4 = new String("p4");
    p5 = new String("p5");

    testUserRemovalRule(x);
    testCapabilityAuthService(x);
    testDeprecatedCapabiltiyJunctionRules(x);
    testCapabilityJunctions(x);
    testCapability(x);
  }

  public void testUserRemovalRule(X x) {
    // make a localuser with 2 capability and remove it from localuserdao 
    // check both junctions r removed
    User user = new User();
    user.setFirstName("TestRemoveUser");
    user.setId(808);
    user = (User) userDAO.put_(x, user);

    Capability inner = new Capability();
    inner.setId("inner");
    inner.setOf(FakeTestObject.getOwnClassInfo());

    Capability outer = new Capability();
    outer.setId("outer");
    outer.setOf(FakeTestObject.getOwnClassInfo());

    inner = (Capability) capabilityDAO.put_(x, inner);
    outer = (Capability) capabilityDAO.put_(x, outer);

    FakeTestObject data = new FakeTestObject();
    data.setUsername("RUBY");
    data.setPassword("PASS");

    UserCapabilityJunction j1 = new UserCapabilityJunction();
    j1.setSourceId(user.getId());
    j1.setTargetId((String) inner.getId());
    j1.setData((FObject) data);
    j1 = (UserCapabilityJunction) userCapabilityJunctionDAO.put_(x, j1);

    UserCapabilityJunction j2 = new UserCapabilityJunction();
    j2.setSourceId(user.getId());
    j2.setTargetId((String) outer.getId());
    j2.setData((FObject) data);
    j2 = (UserCapabilityJunction) userCapabilityJunctionDAO.put_(x, j2);

    userDAO.remove(user);

    List<UserCapabilityJunction> userCapabilityJunctions = (List<UserCapabilityJunction>) ((ArraySink) userCapabilityJunctionDAO
        .where(EQ(UserCapabilityJunction.SOURCE_ID, user.getId()))
        .select(new ArraySink()))
        .getArray();
    
    test(userCapabilityJunctions.size() == 0, "userCapabilityJunctions removed on user removal");
  }

  public void testCapabilityAuthService(X x) {


    AuthService auth = (AuthService) x.get("auth");

    String permission1 = "permission.crunch.*";
    String permission2 = "permission.other.*";
    String permission3 = "permission.crunch.read";
    String permission4 = "permission.other.read.*";

    cas = new CapabilityAuthService();

    FakeTestObject data = new FakeTestObject();
    data.setUsername("RUBY");
    data.setPassword("PASS");

    Capability readCrunch = new Capability();
    Capability readOther = new Capability();
    Capability other = new Capability();
    Capability crunch = new Capability();

    crunch.setId("crunch.*");
    crunch.setPermissionsGranted(new String[] {permission1});
    crunch.setOf(FakeTestObject.getOwnClassInfo());
    crunch = (Capability) capabilityDAO.put_(x, crunch);

    other.setId("other.*");
    other.setPermissionsGranted(new String[] {permission2});
    other.setOf(FakeTestObject.getOwnClassInfo());
    other = (Capability) capabilityDAO.put_(x, other);

    readCrunch.setId("crunch.read");
    readCrunch.setPermissionsGranted(new String[] {permission3});
    readCrunch.setOf(FakeTestObject.getOwnClassInfo());
    readCrunch = (Capability) capabilityDAO.put_(x, readCrunch);    

    readOther.setId("other.read.*");
    readOther.setPermissionsGranted(new String[] {permission4});
    readOther.setOf(FakeTestObject.getOwnClassInfo());
    readOther = (Capability) capabilityDAO.put_(x, readOther);

    UserCapabilityJunction grantReadOther = new UserCapabilityJunction();
    grantReadOther.setSourceId(u1.getId());
    grantReadOther.setTargetId((String) readOther.getId());
    grantReadOther.setData((FObject) data);
    grantReadOther = (UserCapabilityJunction) userCapabilityJunctionDAO.put_(x, grantReadOther);

    UserCapabilityJunction grantCrunch = new UserCapabilityJunction();
    grantCrunch.setSourceId(u1.getId());
    grantCrunch.setTargetId((String) crunch.getId());
    grantCrunch.setData((FObject) data);
    grantCrunch = (UserCapabilityJunction) userCapabilityJunctionDAO.put_(x, grantCrunch);

    test(crunch.implies(x, "crunch.read"), "crunch.* implies crunch.read");
    test(!readCrunch.implies(x, "crunch.write"), "crunch.read does not imply crunch.write");
    test(readOther.implies(x, "other.read.all"), "other.read.* implies other.read.all");
    test(!readCrunch.implies(x, "crunch.*"), "crunch.read does not imply crunch.*");
    test(auth.checkUser(x, u1, "crunch.*"), "user has capability crunch.*");
    test(auth.checkUser(x, u1, "crunch.read"), "user has capability crunch.read");
    test(!auth.checkUser(x, u1, "other.*"), "user does not have capability other.*");
    test(auth.checkUser(x, u1, "other.read"), "user has capability other.read");
    test(auth.checkUser(x, u1, "other.read.all"), "user does have capability other.read.all");
    test(!auth.checkUser(x, u1, "other.write"), "user does not have capability other.write");
    test(!auth.checkUser(x, u1, "cruch"), "user does not have permission or capability named cruch");
    test(crunch.implies(x, "permission.crunch.*"), "capability crunch.* implies permission permission.crunch.*");
    test(crunch.implies(x, "permission.crunch.read"), "capability crunch.* implies permission.crunch.read");
    test(!readCrunch.implies(x, "permission.crunch.write"), "capability crunch.read does not imply permission.crunch.write");
    test(readOther.implies(x, "permission.other.read.all"), "permission.other.read.* implies permissionother.read.all");
    test(!readCrunch.implies(x, "permission.crunch.*"), "permission.crunch.read does not imply permission.crunch.*");
    test(auth.checkUser(x, u1, "permission.crunch.*"), "user has permission permission.crunch.*");
    test(auth.checkUser(x, u1, "permission.crunch.read"), "user has permission permission.crunch.read");
    test(!auth.checkUser(x, u1, "permission.other.*"), "user does not have permission permission.other.*");
    test(auth.checkUser(x, u1, "permission.other.read"), "user has permission permission.other.read");
    test(auth.checkUser(x, u1, "permission.other.read.all"), "user does have permission permission.other.read.all");
    test(!auth.checkUser(x, u1, "permission.other.write"), "user does not have permission permission.other.write");

  }

  public void testDeprecatedCapabiltiyJunctionRules(X x) {
    Capability c0 = new Capability();
    Capability c1 = new Capability();
    Capability c2 = new Capability();

    FakeTestObject data = new FakeTestObject();
    data.setUsername("RUBY");
    data.setPassword("PASS");
    
    c0.setId("c0"); 
    c0.setOf(FakeTestObject.getOwnClassInfo());
    c0 = (Capability) capabilityDAO.put_(x, c0);
    c1.setId("c1");
    c1.setOf(FakeTestObject.getOwnClassInfo());
    c1 = (Capability) capabilityDAO.put_(x, c1);
    c2.setId("c2");
    c2.setOf(FakeTestObject.getOwnClassInfo());
    c2 = (Capability) capabilityDAO.put_(x, c2);

    CapabilityCapabilityJunction j1 = new CapabilityCapabilityJunction();
    j1.setSourceId((String) c0.getId());
    j1.setTargetId((String) c1.getId());
    j1 = (CapabilityCapabilityJunction) prerequisiteCapabilityJunctionDAO.put_(x, j1);

    UserCapabilityJunction uj1 = new UserCapabilityJunction();
    uj1.setSourceId(u1.getId());
    uj1.setTargetId((String) c0.getId());
    uj1.setData((FObject) data);
    uj1 = (UserCapabilityJunction) userCapabilityJunctionDAO.put_(x, uj1);

    UserCapabilityJunction uj2 = new UserCapabilityJunction();
    uj2.setSourceId(u1.getId());
    uj2.setTargetId((String) c1.getId());
    uj2.setData((FObject) data);
    uj2 = (UserCapabilityJunction) userCapabilityJunctionDAO.put_(x, uj2);

    UserCapabilityJunction uj3 = new UserCapabilityJunction();
    uj3.setSourceId(u1.getId());
    uj3.setTargetId((String) c2.getId());
    uj3.setData((FObject) data);
    uj3 = (UserCapabilityJunction) userCapabilityJunctionDAO.put_(x, uj3);


    CapabilityCapabilityJunction j2 = new CapabilityCapabilityJunction();
    j2.setSourceId((String) c0.getId());
    j2.setTargetId((String) c2.getId());
    j2 = (CapabilityCapabilityJunction) deprecatedCapabilityJunctionDAO.put_(x, j2);

    uj1 = (UserCapabilityJunction) userCapabilityJunctionDAO.find(AND(
      EQ(UserCapabilityJunction.SOURCE_ID, uj1.getSourceId()),
      EQ(UserCapabilityJunction.TARGET_ID, (String) uj1.getTargetId())
    ));
    uj2 = (UserCapabilityJunction) userCapabilityJunctionDAO.find(AND(
      EQ(UserCapabilityJunction.SOURCE_ID, uj2.getSourceId()),
      EQ(UserCapabilityJunction.TARGET_ID, (String) uj2.getTargetId())
    ));
    c0 = (Capability) capabilityDAO.find("c0");
    c1 = (Capability) capabilityDAO.find("c1");
    // test(uj1.getStatus() == CapabilityJunctionStatus.DEPRECATED, "UserCapabilityJunction Status between user and c0 is set to deprecated");
    // test(!c0.getEnabled(), "c0 is set to disabled");
    test(uj2.getStatus() == CapabilityJunctionStatus.GRANTED, "UserCapabilityJunction Status between user and c1 is still granted");
    test(c1.getEnabled(), "c1 is still enabled");

  }

  public void testCapabilityJunctions(X x) {
    String permission1 = "innerPermission1";
    String permission2 = "innerPermission2";
    String permission3 = "outerPermission";

    Capability inner = new Capability();
    inner.setId("inner");
    inner.setPermissionsGranted(new String[]{permission1, permission2});
    inner.setOf(FakeTestObject.getOwnClassInfo());

    Capability outer = new Capability();
    outer.setId("outer");
    outer.setPermissionsGranted(new String[]{permission3});
    outer.setOf(FakeTestObject.getOwnClassInfo());

    inner = (Capability) capabilityDAO.put_(x, inner);
    outer = (Capability) capabilityDAO.put_(x, outer);
    
    CapabilityCapabilityJunction prereqJunction = new CapabilityCapabilityJunction();
    prereqJunction.setSourceId((String) inner.getId());
    prereqJunction.setTargetId((String) outer.getId());
    prereqJunction = (CapabilityCapabilityJunction) prerequisiteCapabilityJunctionDAO.put_(x, prereqJunction);

    FakeTestObject data = new FakeTestObject();
    data.setUsername("RUBY");
    data.setPassword("SPSA");

    UserCapabilityJunction junction1 = new UserCapabilityJunction();
    junction1.setSourceId(u1.getId());
    junction1.setTargetId((String) inner.getId());
    junction1.setData((FObject) data);
    junction1 = (UserCapabilityJunction) userCapabilityJunctionDAO.put_(x, junction1);
    test(junction1.getStatus() == CapabilityJunctionStatus.PENDING, "status is pending for wrong data");

    UserCapabilityJunction junction2 = new UserCapabilityJunction();
    junction2.setSourceId(u1.getId());
    junction2.setTargetId((String) outer.getId());
    data.setPassword("PASS");
    junction2.setData((FObject) data);
    junction2 = (UserCapabilityJunction) userCapabilityJunctionDAO.put_(x, junction2);
    test(junction2.getStatus() == CapabilityJunctionStatus.PENDING, "status is pending since prereq not granted");

    junction1 = (UserCapabilityJunction) junction1.fclone();
    junction1.setData(data);
    junction1 = (UserCapabilityJunction) userCapabilityJunctionDAO.put_(x, junction1);
    test(junction1.getStatus() == CapabilityJunctionStatus.GRANTED, "status is now granted for correct data");

    junction2 = (UserCapabilityJunction) userCapabilityJunctionDAO.find(AND(EQ(UserCapabilityJunction.SOURCE_ID, junction2.getSourceId()), EQ(UserCapabilityJunction.TARGET_ID, junction2.getTargetId())));

    // test(junction2.getStatus() == CapabilityJunctionStatus.GRANTED, "status is granted since prereq granted"); 
  }

  public void testCapability(X x) {
    // test creating a capability
    c1 = new Capability();
    c1.setId("c1");
    c1.setIcon("icon.path");
    c1.setDescription("The first ever capability!");
    c1.setNotes("noted");
    c1.setVersion("0.0.0.0");
    c1.setEnabled(true);
    c1.setVisible(false);
    c1.setPermissionsGranted( new String[] {p1} );
    c1.setExpiry((Date) ((new GregorianCalendar(2867, Calendar.JULY, 1)).getTime()));
    c1 = (Capability) capabilityDAO.put(c1);
    test(c1 instanceof Capability, "Capability created");

    // test the capability.implies method where implies should return true
    c2 = new Capability();
    c2.setId("c2");
    c2.setPermissionsGranted( new String[] {p2});

    prereqJunction = new CapabilityCapabilityJunction();
    prereqJunction.setSourceId((String) c1.getId());
    prereqJunction.setTargetId((String) c2.getId());
    prereqJunction = (CapabilityCapabilityJunction) prerequisiteCapabilityJunctionDAO.put(prereqJunction);

    c2 = (Capability) capabilityDAO.put(c2);
    test(c2.implies(x, p1), "c2 implies p1");

    // test the capability.implies method where implies should return false;
    test(!c1.implies(x, p2), "c1 does not imply p2");

    // test disabled capability does not imply their permissions granted
    c2 = ((Capability) c2.fclone());
    c2.setEnabled(false);
    c2 = (Capability) capabilityDAO.put(c2);
    test((!c2.implies(x, p1)) && (!c2.implies(x, p2)), "c2 disabled and does not imply p1 and p2");

    // test re-enabled capability imply their permissions granted
    c2 = ((Capability) c2.fclone());
    c2.setEnabled(true);
    c2 = (Capability) capabilityDAO.put(c2);
    test(c2.implies(x, p1) && c2.implies(x, p2), "c2 re-enabled implies p1 and p2");
  }
 
}
