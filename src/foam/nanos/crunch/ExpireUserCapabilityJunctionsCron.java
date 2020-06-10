/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.crunch;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.crunch.Capability;
import foam.nanos.crunch.CapabilityJunctionStatus;
import foam.nanos.crunch.UserCapabilityJunction;
import foam.nanos.logger.Logger;
import java.util.List;
import java.util.Date;

import static foam.mlang.MLang.*;

public class ExpireUserCapabilityJunctionsCron implements ContextAgent {

  private Logger logger;
  private DAO userCapabilityJunctionDAO;

  @Override
  public void execute(X x) {
    logger = (Logger) x.get("logger");
    userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
    Date today = new Date();

    // Only active, i.e., GRANTED, UserCapabilityJunctions should be checked
    List<UserCapabilityJunction> activeJunctions = ((ArraySink) userCapabilityJunctionDAO
      .where(AND(
        EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.GRANTED),
        NEQ(UserCapabilityJunction.EXPIRY, null),
        LT(UserCapabilityJunction.EXPIRY, today)
      ))
      .select(new ArraySink()))
      .getArray();

    for ( UserCapabilityJunction activeJunction : activeJunctions ) {
      activeJunction.setStatus(CapabilityJunctionStatus.EXPIRED);
      userCapabilityJunctionDAO.put(activeJunction);
      logger.debug("Expired UserCapabilityJunction : " + activeJunction.getId());
    }
  }
}