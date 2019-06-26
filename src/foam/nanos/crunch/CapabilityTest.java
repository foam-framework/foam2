package foam.nanos.crunch;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.nanos.auth.User;
import foam.nanos.auth.*;
import foam.nanos.auth.CapabilityAuthService;
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

import java.util.List;

import static foam.mlang.MLang.*;

public class CapabilityTest extends Test {
  Capability c1, c2, c3, c4, c5, c6, c7, c8, c9;
  User u1;
  String p1, p2, p3, p4, p5;
  DAO userDAO, capabilityDAO, userCapabilityJunctionDAO, capabilityCapabilityJunctionDAO;
  UserCapabilityJunction ucJunction;
  CapabilityAuthService cas;

  public void runTest(X x) {
    x = TestUtils.mockDAO(x, "localUserDAO");
    DAO dao = new CapabilityDAO.Builder(x).setDelegate(new MDAO(Capability.getOwnClassInfo())).build();
    x = x.put("capabilityDAO", dao);
    dao = new UserCapabilityJunctionDAO.Builder(x).setDelegate(new MDAO(UserCapabilityJunction.getOwnClassInfo())).build();
    x = x.put("userCapabilityJunctionDAO", dao);
    dao = new CapabilityCapabilityJunctionDAO.Builder(x).setDelegate(new MDAO(CapabilityCapabilityJunction.getOwnClassInfo())).build();
    x = x.put("capabilityCapabilityJunctionDAO", dao);

    userDAO = (DAO) x.get("localUserDAO");
    capabilityDAO = (DAO) x.get("capabilityDAO");
    userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
    capabilityCapabilityJunctionDAO = (DAO) x.get("capabilityCapabilityJunctionDAO");

    x.put("user", (User) userDAO.find(1348));

    u1 = new User();
    u1.setFirstName("TestUser");
    u1.setId(88);
    userDAO.put(u1);

    p1 = new String("p1");
    p2 = new String("p2");
    p3 = new String("p3");
    p4 = new String("p4");
    p5 = new String("p5");

    testCapability(x);
    testUserCapabilityJunction(x);
    testCapabilityAuthService(x);
    testCapabilityCapabilityJunction(x);

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
    c1.setPermissionsGranted( new String[] {p1});
    c1 = (Capability) capabilityDAO.put(c1);
    test(c1 instanceof Capability, "1. Capability created");

    // 2. test the capability.implies method where implies should return true
    c2 = new Capability();
    c2.setName("c2");
    c2.setPermissionsGranted( new String[] {p2});
    c2.setCapabilitiesRequired( new String[] {(String) c1.getId()});
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

  public void testCapabilityAuthService(X x) {
    cas = new CapabilityAuthService();

    //9. test checkUser for permission implied by capability
    test(cas.checkUser(x, u1, p1), "9. u1 has permission p1 implied by c1");

    //10. test checkUser for permission not implied by capability
    test(!cas.checkUser(x, u1, p3), "10. u1 does not have permission p3");

    //11. test checkUser for permission implied by capability not yet granted
    c3 = new Capability();
    c3.setName("c3");
    c3.setPermissionsGranted(new String[]{p1, p3});
    c3 = (Capability) capabilityDAO.put(c3);
    UserCapabilityJunction ucJunction3 = new UserCapabilityJunction();
    ucJunction3.setSourceId(u1.getId());
    ucJunction3.setTargetId((String) c3.getId());
    test(!cas.checkUser(x, u1, p3), "11. u1 does not have permission p3 implied by capability c3 not yet granted");

    // 12. set c3 to granted and checkuser
    ucJunction3 = (UserCapabilityJunction) ucJunction3.fclone();
    ucJunction3.setStatus(CapabilityJunctionStatus.GRANTED);
    ucJunction3 = (UserCapabilityJunction) userCapabilityJunctionDAO.put(ucJunction3);
    test(cas.checkUser(x, u1, p3), "12. u1 has permission p3 implied by granted capability c3");

    // 13. set c1 to to grant permission "p4" and check if user has the permission
    c1 = (Capability) c1.fclone();
    c1.setPermissionsGranted(new String[] {p1, p4});
    c1 = (Capability) capabilityDAO.put(c1);
    test(cas.checkUser(x, u1, p4), "13. u1 has permission p4");


  }

  public void testCapabilityCapabilityJunction(X x) {

    c5 = new Capability();
    c5.setName("c5");
    c5.setCapabilitiesRequired(new String[]{"c1"});
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
    ccJunction = (CapabilityCapabilityJunction) capabilityCapabilityJunctionDAO.put(ccJunction);

    // 14. check if the deprecated capability is set to disabled
    c1 = (Capability) capabilityDAO.find("c1");
    test(!c1.getEnabled(), "14. deprecated capabilities are disabled");

    // 15. check if the usercapabilityjunction between c1 and u1 is set to deprecated
    ucJunction = (UserCapabilityJunction) ((List<UserCapabilityJunction>) ((ArraySink) userCapabilityJunctionDAO
          .where(AND(
            EQ(UserCapabilityJunction.SOURCE_ID, u1.getId()),
            EQ(UserCapabilityJunction.TARGET_ID, (String) c1.getId())
          ))
          .select(new ArraySink()))
          .getArray()).get(0);
    test(ucJunction.getStatus() == CapabilityJunctionStatus.DEPRECATED, "15. ucjunctions where target is deprecated gets status DEPRECATED");

    // 16. check if user still has permission p4 (shouldn't)
    test(!cas.checkUser(x, u1, p4), "16. u1 no longer has permission p4");

    // 17. check that user still has p1 and p3
    test(cas.checkUser(x, u1, p1) && cas.checkUser(x, u1, p3) && cas.checkUser(x, u1, p5) && cas.checkUser(x, u1, p2), "17. user still has correct permissions");


  }

}
