package foam.nanos.crunch;
import foam.core.*;
import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.nanos.auth.User;
import foam.nanos.auth.*;
import foam.nanos.auth.CapabilityAuthService;
import foam.nanos.auth.AuthService;
import foam.nanos.crunch.Capability;
import foam.nanos.crunch.CapabilityCapabilityJunction;
import foam.nanos.crunch.UserCapabilityJunction;
import foam.nanos.crunch.CapabilityJunctionStatus;
import foam.nanos.test.Test;
import foam.test.TestUtils;
import java.security.Permission;
import java.util.Date;
import java.util.Calendar;
import java.util.GregorianCalendar;
import foam.nanos.crunch.FakeDataObject;
import foam.core.ContextAwareAgent;
import foam.mlang.predicate.Predicate;
import foam.nanos.ruler.*;

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
    DAO dao = new CapabilityDAO.Builder(x).setDelegate(new MDAO(Capability.getOwnClassInfo())).build();
    x = x.put("capabilityDAO", dao);
    dao = new UserCapabilityJunctionDAO.Builder(x).setDelegate(new MDAO(UserCapabilityJunction.getOwnClassInfo())).build();
    dao = new RulerDAO(x, dao, "userCapabilityJunctionDAO");
    x = x.put("userCapabilityJunctionDAO", dao);
    dao = new DeprecatedCapabilityJunctionDAO.Builder(x).setDelegate(new MDAO(CapabilityCapabilityJunction.getOwnClassInfo())).build();
    dao = new RulerDAO(x, dao, "deprecatedCapabilityJunctionDAO");
    x = x.put("deprecatedCapabilityJunctionDAO", dao);
    dao = new PrerequisiteCapabilityJunctionDAO.Builder(x).setDelegate(new MDAO(CapabilityCapabilityJunction.getOwnClassInfo())).build();
    x = x.put("prerequisiteCapabilityJunctionDAO", dao);

    userDAO = (DAO) x.get("localUserDAO");
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

    // testCapabilityData(x);
    testCapabilityAuthService(x);
  }

  public void testCapabilityAuthService(X x) {


    AuthService auth = (AuthService) x.get("auth");

    String permission1 = "permission.crunch.*";
    String permission2 = "permission.other.*";
    String permission3 = "permission.crunch.read";
    String permission4 = "permission.other.read.*";

    cas = new CapabilityAuthService();

    FakeDataObject data = new FakeDataObject();
    data.setUsername("RUBY");
    data.setPassword("PASS");

    Capability readCrunch = new Capability();
    Capability readOther = new Capability();
    Capability other = new Capability();
    Capability crunch = new Capability();

    crunch.setName("crunch.*");
    crunch.setPermissionsGranted(new String[] {permission1});
    crunch.setOf(FakeDataObject.getOwnClassInfo());
    crunch = (Capability) capabilityDAO.put_(x, crunch);

    other.setName("other.*");
    other.setPermissionsGranted(new String[] {permission2});
    other.setOf(FakeDataObject.getOwnClassInfo());
    other = (Capability) capabilityDAO.put_(x, other);

    readCrunch.setName("crunch.read");
    readCrunch.setPermissionsGranted(new String[] {permission3});
    readCrunch.setOf(FakeDataObject.getOwnClassInfo());
    readCrunch = (Capability) capabilityDAO.put_(x, readCrunch);    

    readOther.setName("other.read.*");
    readOther.setPermissionsGranted(new String[] {permission4});
    readOther.setOf(FakeDataObject.getOwnClassInfo());
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

  public void testCapabilityData(X x) {
    String permission1 = "innerPermission1";
    String permission2 = "innerPermission2";
    String permission3 = "outerPermission";

    Capability inner = new Capability();
    inner.setName("inner");
    inner.setPermissionsGranted(new String[]{permission1, permission2});
    inner.setOf(FakeDataObject.getOwnClassInfo());

    Capability outer = new Capability();
    outer.setName("outer");
    outer.setPermissionsGranted(new String[]{permission3});
    outer.setOf(FakeDataObject.getOwnClassInfo());

    inner = (Capability) capabilityDAO.put_(x, inner);
    outer = (Capability) capabilityDAO.put_(x, outer);
    
    CapabilityCapabilityJunction prereqJunction = new CapabilityCapabilityJunction();
    prereqJunction.setSourceId((String) inner.getId());
    prereqJunction.setTargetId((String) outer.getId());
    prereqJunction = (CapabilityCapabilityJunction) prerequisiteCapabilityJunctionDAO.put_(x, prereqJunction);

    FakeDataObject data = new FakeDataObject();
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

    test(junction2.getStatus() == CapabilityJunctionStatus.GRANTED, "status is granted since prereq granted"); 
  }

  public void testCapability(X x) {
    // 1. test creating a capability
    c1 = new Capability();
    c1.setName("c1");
    c1.setIcon("icon.path");
    c1.setDescription("The first ever capability!");
    c1.setNotes("noted");
    c1.setVersion("0.0.0.0");
    c1.setEnabled(true);
    c1.setVisible(false);
    c1.setPermissionsGranted( new String[] {p1} );
    c1.setExpiry((Date) ((new GregorianCalendar(2867, Calendar.JULY, 1)).getTime()));
    c1 = (Capability) capabilityDAO.put(c1);
    test(c1 instanceof Capability, "1. Capability created");

    // 2. test the capability.implies method where implies should return true
    c2 = new Capability();
    c2.setName("c2");
    c2.setPermissionsGranted( new String[] {p2});

    prereqJunction = new CapabilityCapabilityJunction();
    prereqJunction.setSourceId((String) c1.getName());
    prereqJunction.setTargetId((String) c2.getName());
    prereqJunction = (CapabilityCapabilityJunction) prerequisiteCapabilityJunctionDAO.put(prereqJunction);

    c2 = (Capability) capabilityDAO.put(c2);
    test(c2.implies(x, p1), "2. c2 implies p1");

    // 3. test the capability.implies method where implies should return false;
    test(!c1.implies(x, p2), "3. c1 does not imply p2");

    // 4. test disabled capability does not imply their permissions granted
    c2 = ((Capability) c2.fclone());
    c2.setEnabled(false);
    c2 = (Capability) capabilityDAO.put(c2);
    test((!c2.implies(x, p1)) && (!c2.implies(x, p2)), "4. c2 disabled and does not imply p1 and p2");

    // 5. test re-enabled capability imply their permissions granted
    c2 = ((Capability) c2.fclone());
    c2.setEnabled(true);
    c2 = (Capability) capabilityDAO.put(c2);
    test(c2.implies(x, p1) && c2.implies(x, p2), "5. c2 re-enabled implies p1 and p2");
  }

  public void testUserCapabilityJunction(X x) {
    // 6. try to add a ucJunction
    ucJunction = new UserCapabilityJunction();
    ucJunction.setSourceId(u1.getId());
    ucJunction.setTargetId((String) c1.getId());
    ucJunction.setStatus(CapabilityJunctionStatus.PENDING);
    ucJunction.setCreated((Date) new GregorianCalendar().getTime());
    ucJunction.setExpiry((Date) (c1.getExpiry()));
    ucJunction = (UserCapabilityJunction) userCapabilityJunctionDAO.put(ucJunction);
    test(ucJunction instanceof UserCapabilityJunction, "6. ucJunction successfully created");

    // 7. try to add a granted ucjunction with prereqs not fulfilled
    final UserCapabilityJunction ucJunction1 = new UserCapabilityJunction();
    ucJunction1.setSourceId(u1.getId());
    ucJunction1.setTargetId((String)c2.getId());
    ucJunction1.setStatus(CapabilityJunctionStatus.GRANTED);
    test(
      TestUtils.testThrows(
        () -> userCapabilityJunctionDAO.put(ucJunction1),
        "One or more prerequisite capabilities not fulfilled",
        AuthorizationException.class
      ),
      "7. should throw 'AuthorizationException' when prereq not fulfilled"
    );
    
    // 8. grant user prereqs and try again
    ucJunction = (UserCapabilityJunction) ucJunction.fclone();
    ucJunction.setStatus(CapabilityJunctionStatus.GRANTED);
    ucJunction = (UserCapabilityJunction) userCapabilityJunctionDAO.put(ucJunction);

    UserCapabilityJunction ucj1 = (UserCapabilityJunction) userCapabilityJunctionDAO.put(ucJunction1);
    test(ucj1 != null, "8. junction with prereqs fulfilled added successfully");
  }


  public void testCapabilityCapabilityJunction(X x) {

    c5 = new Capability();
    c5.setName("c5");
    // c5.setCapabilitiesRequired(new String[]{"c1"});
    prereqJunction = new CapabilityCapabilityJunction();
    prereqJunction.setSourceId((String) c1.getName());
    prereqJunction.setTargetId((String) c5.getName());
    prereqJunction = (CapabilityCapabilityJunction) prerequisiteCapabilityJunctionDAO.put(prereqJunction);

    c5.setPermissionsGranted(new String[]{p5});
    c5 = (Capability) capabilityDAO.put(c5);
    UserCapabilityJunction ucJunction5 = new UserCapabilityJunction();
    ucJunction5.setSourceId(u1.getId());
    ucJunction5.setTargetId((String) c5.getId());
    ucJunction5.setStatus(CapabilityJunctionStatus.GRANTED);
    ucJunction5 = (UserCapabilityJunction) userCapabilityJunctionDAO.put(ucJunction5);

    // set junction between c1 and c3 - c1 is deprecated by c3
    CapabilityCapabilityJunction ccJunction = new CapabilityCapabilityJunction();
    ccJunction.setSourceId((String) c1.getId());
    ccJunction.setTargetId((String) c3.getId());
    ccJunction = (CapabilityCapabilityJunction) deprecatedCapabilityJunctionDAO.put(ccJunction);

    // 14. check if the deprecated capability is set to disabled
    c1 = (Capability) capabilityDAO.find("c1");
    test(!c1.getEnabled(), "14. deprecated capabilities are disabled");

    // 15. check if the usercapabilityjunction between c1 and u1 is set to deprecated

    ucJunction = (UserCapabilityJunction) userCapabilityJunctionDAO.find(AND(
        EQ(UserCapabilityJunction.SOURCE_ID, u1.getId()),
        EQ(UserCapabilityJunction.TARGET_ID, (String) c1.getId())
    ));
    test(ucJunction.getStatus() == CapabilityJunctionStatus.DEPRECATED, "15. ucjunctions where target is deprecated gets status DEPRECATED");

    // 16. check if user still has permission p4 (shouldn't)
    test(!cas.checkUser(x, u1, p4), "16. u1 no longer has permission p4");

    // 17. check that user still has p1 and p3
    test(cas.checkUser(x, u1, p1) && cas.checkUser(x, u1, p3) && cas.checkUser(x, u1, p5) && cas.checkUser(x, u1, p2), "17. user still has correct permissions");


  }

}
