package foam.nanos.crunch.crunchtest;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.crunch.Capability;
import foam.nanos.crunch.MinMaxCapability;
import foam.nanos.crunch.CapabilityCapabilityJunction;
import foam.nanos.crunch.UserCapabilityJunction;
import foam.nanos.crunch.CapabilityJunctionPayload;
import foam.nanos.crunch.lite.Capable;
import foam.nanos.test.Test;
import foam.test.TestUtils;

import static foam.nanos.crunch.CapabilityJunctionStatus.*;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

public class CapableTest extends Test {
  private Capability A, B, AA, AB, AC, BA, BB, BC;
  private DAO capabilityDAO, prerequisiteCapabilityJunctionDAO;

  public void runTest(X x) {
    x = createTestX(x);

    // Rules
    testCapablePayloadDAO(x);
    testSetCapablePayloadStatusOnPut(x);
  }

  public void testSetCapablePayloadStatusOnPut(X x) {
    Capable capable = new TestCapable();
    capable.setRequirements(x, new String[]{"A", "B"});
    DAO capablePayloadDAO = capable.getCapablePayloadDAO(x);
    CapabilityJunctionPayload payload = null;

    // Default capability tests
    payload = (CapabilityJunctionPayload) capablePayloadDAO.find("AA");
    payload.setStatus(GRANTED);
    capablePayloadDAO.put(payload);
    payload = (CapabilityJunctionPayload) capablePayloadDAO.find("AB");
    payload.setStatus(GRANTED);
    capablePayloadDAO.put(payload);
    payload = (CapabilityJunctionPayload) capablePayloadDAO.find("A");
    test(payload.getStatus() == ACTION_REQUIRED,
      "Dependant capability should be ACTION_REQUIRED"
    );
    payload = (CapabilityJunctionPayload) capablePayloadDAO.find("AC");
    payload.setStatus(PENDING);
    capablePayloadDAO.put(payload);
    payload = (CapabilityJunctionPayload) capablePayloadDAO.find("A");
    test(payload.getStatus() == ACTION_REQUIRED,
      "Dependant capability should be PENDING"
    );
    payload = (CapabilityJunctionPayload) capablePayloadDAO.find("AC");
    payload.setStatus(GRANTED);
    capablePayloadDAO.put(payload);
    payload = (CapabilityJunctionPayload) capablePayloadDAO.find("A");
    test(payload.getStatus() == GRANTED,
      "Dependant capability should be GRANTED"
    );

    // MinMaxCapability tests
    payload = (CapabilityJunctionPayload) capablePayloadDAO.find("BA");
    payload.setStatus(PENDING);
    capablePayloadDAO.put(payload);
    payload = (CapabilityJunctionPayload) capablePayloadDAO.find("B");
    test(payload.getStatus() == PENDING,
      "Dependant MinMax capability should be PENDING"
    );
  }

  public void testCapablePayloadDAO(X x) {
    Capable capable = new TestCapable();
    capable.setRequirements(x, new String[]{"A", "B"});
    DAO capablePayloadDAO = capable.getCapablePayloadDAO(x);
    CapabilityJunctionPayload payload = null;
    payload = (CapabilityJunctionPayload) capablePayloadDAO.find("AA");
    test(payload != null, "known payload should not be null");
    payload = (CapabilityJunctionPayload) capablePayloadDAO.find("NONE");
    test(payload == null, "unknown payload should be null");
  }

  public X createTestX(X x) {
    x = TestUtils.mockDAO(x, "capabilityDAO");
    x = TestUtils.mockDAO(x, "prerequisiteCapabilityJunctionDAO");
    DAO dao = new foam.nanos.crunch.PredicatedPrerequisiteCapabilityJunctionDAO.Builder(x).setDelegate(new foam.dao.MDAO(CapabilityCapabilityJunction.getOwnClassInfo())).build();
    x = x.put("prerequisiteCapabilityJunctionDAO", dao);

    capabilityDAO = (DAO)
      x.get("capabilityDAO");
    prerequisiteCapabilityJunctionDAO = (DAO)
      x.get("prerequisiteCapabilityJunctionDAO");

    A = new Capability.Builder(x).setId("A").build();
    AA = new Capability.Builder(x).setId("AA").build();
    AB = new Capability.Builder(x).setId("AB").build();
    AC = new Capability.Builder(x).setId("AC").build();
    B = new MinMaxCapability.Builder(x)
      .setId("B")
      .setMin(1)
      .setMax(2)
      .build();
    BA = new Capability.Builder(x).setId("BA").build();
    BB = new Capability.Builder(x).setId("BB").build();
    BC = new Capability.Builder(x).setId("BC").build();

    capabilityDAO.put(A);
    capabilityDAO.put(AA);
    capabilityDAO.put(AB);
    capabilityDAO.put(AC);
    capabilityDAO.put(B);
    capabilityDAO.put(BA);
    capabilityDAO.put(BB);
    capabilityDAO.put(BC);

    prerequisiteCapabilityJunctionDAO.put(
      new CapabilityCapabilityJunction.Builder(x)
        .setSourceId("A").setTargetId("AA").build());
    prerequisiteCapabilityJunctionDAO.put(
      new CapabilityCapabilityJunction.Builder(x)
        .setSourceId("A").setTargetId("AB").build());
    prerequisiteCapabilityJunctionDAO.put(
      new CapabilityCapabilityJunction.Builder(x)
        .setSourceId("A").setTargetId("AC").build());
    prerequisiteCapabilityJunctionDAO.put(
      new CapabilityCapabilityJunction.Builder(x)
        .setSourceId("B").setTargetId("BA").build());
    prerequisiteCapabilityJunctionDAO.put(
      new CapabilityCapabilityJunction.Builder(x)
        .setSourceId("B").setTargetId("BB").build());
    prerequisiteCapabilityJunctionDAO.put(
      new CapabilityCapabilityJunction.Builder(x)
        .setSourceId("B").setTargetId("BC").build());
    return x;
  }
}
