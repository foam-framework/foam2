/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.crunch;

import foam.core.ContextAgent;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.crunch.CapabilityJunctionStatus;
import foam.nanos.crunch.UserCapabilityJunction;
import foam.nanos.logger.Logger;
import java.util.List;

import static foam.mlang.MLang.*;

public class DecrementGraceDaysLeftCron implements ContextAgent {

  private Logger logger;
  private DAO userCapabilityJunctionDAO;

  @Override
  public void execute(X x) {
    logger = (Logger) x.get("logger");
    userCapabilityJunctionDAO = (DAO) x.get("bareUserCapabilityJunctionDAO");

    List<UserCapabilityJunction> junctions = ((ArraySink) userCapabilityJunctionDAO
      .where(AND(
        EQ(UserCapabilityJunction.IS_IN_GRACE_PERIOD, true),
        GT(UserCapabilityJunction.GRACE_PERIOD, 0)
      ))
      .select(new ArraySink()))
      .getArray();

    for ( UserCapabilityJunction ucj : junctions ) {
      ucj = (UserCapabilityJunction) ucj.fclone();
      ucj.setGracePeriod(ucj.getGracePeriod() - 1);
      logger.debug("Decrementing grace days left for UserCapabilityJunction : " + ucj.getId());
      userCapabilityJunctionDAO.put(ucj);
    }

  }
}