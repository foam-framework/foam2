/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.crunch;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Queue;
import static foam.mlang.MLang.*;

public class ServerCrunchService implements CrunchService {
  public List getGrantPath(X x, String rootId) {
    Logger logger = (Logger) x.get("logger");

    DAO prerequisiteDAO = (DAO) x.get("prerequisiteCapabilityJunctionDAO");
    DAO capabilityDAO = (DAO) x.get("capabilityDAO");

    // Lookup for indices of previously observed capabilities
    List<String> alreadyListed = new ArrayList<String>();

    // List of capabilities required to grant the desired capability.
    // Throughout the traversial algorithm this list starts with parents of
    // prerequisites appearing earlier in the list. Before returning, this
    // list is reversed so that the caller receives capabilities in order of
    // expected completion (i.e. pre-order traversial)
    List grantPath = new ArrayList<>();

    Queue<String> nextSources = new ArrayDeque<String>();
    nextSources.add(rootId);

    // Doing this instead of "this" could prevent unexpected behaviour
    // in the incident CrunchService's getJunction method is decorated
    CrunchService crunchService = (CrunchService) x.get("crunchService");

    while ( nextSources.size() > 0 ) {
      String sourceCapabilityId = nextSources.poll();

      UserCapabilityJunction ucj = crunchService.getJunction(x, sourceCapabilityId);
      if ( ucj != null && ucj.getStatus() == CapabilityJunctionStatus.GRANTED ) {
        continue;
      }

      if ( alreadyListed.contains(sourceCapabilityId) ) continue;

      // Add capability to grant path, and remember index in case it's replaced
      Capability cap = (Capability) capabilityDAO.find(sourceCapabilityId);

      alreadyListed.add(sourceCapabilityId);
      grantPath.add(cap);

      // Enqueue prerequisites for adding to grant path
      List prereqs = ( (ArraySink) prerequisiteDAO
        .where(AND(
          EQ(CapabilityCapabilityJunction.SOURCE_ID, sourceCapabilityId),
          NOT(IN(CapabilityCapabilityJunction.TARGET_ID, alreadyListed))
        ))
        .select(new ArraySink()) ).getArray();
      for ( int i = prereqs.size() - 1; i >= 0; i-- ) {
        CapabilityCapabilityJunction prereq = (CapabilityCapabilityJunction) prereqs.get(i);
        nextSources.add(prereq.getTargetId());
      }
    }

    Collections.reverse(grantPath);
    return grantPath;
  }

  public UserCapabilityJunction getJunction(X x, String capabilityId) {
    User user = ((Subject) x.get("subject")).getUser();
    User realUser = ((Subject) x.get("subject")).getRealUser();

    Predicate acjPredicate = INSTANCE_OF(AgentCapabilityJunction.class);
    Predicate targetPredicate = EQ(UserCapabilityJunction.TARGET_ID, capabilityId);
    try {
      DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");

      Predicate associationPredicate = OR(
        AND(
          NOT(acjPredicate),
          ( user != realUser )
            // Check if a ucj implies the subject.user has this permission
            ? OR(
                EQ(UserCapabilityJunction.SOURCE_ID, realUser.getId()),
                EQ(UserCapabilityJunction.SOURCE_ID, user.getId())
              )
            // Check if a ucj implies the subject.realUser has this permission
            : EQ(UserCapabilityJunction.SOURCE_ID, realUser.getId())
        ),
        AND(
          acjPredicate,
          // Check if a ucj implies the subject.realUser has this permission in relation to the user
          EQ(UserCapabilityJunction.SOURCE_ID, realUser.getId()),
          EQ(AgentCapabilityJunction.EFFECTIVE_USER, user.getId())
        )
      );

      // Check if a ucj implies the subject.realUser has this permission in relation to the user
      UserCapabilityJunction ucj = (UserCapabilityJunction)
        userCapabilityJunctionDAO.find(AND(associationPredicate,targetPredicate));
      if ( ucj != null ) {
        return ucj;
      }

    } catch ( Exception e ) {
      Logger logger = (Logger) x.get("logger");
      logger.error("getJunction", capabilityId, e);
    }

    return null;
  }
}