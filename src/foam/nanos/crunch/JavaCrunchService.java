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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import static foam.mlang.MLang.*;

public class JavaCrunchService implements CrunchService {
  public List getGrantPath(X x, String rootId) {
    Logger logger = (Logger) x.get("logger");

    DAO prerequisiteDAO = (DAO) x.get("prerequisiteCapabilityJunctionDAO");
    DAO capabilityDAO = (DAO) x.get("capabilityDAO");

    // Lookup for indices of previously observed capabilities
    Map<String,Integer> alreadyListed = new HashMap<String,Integer>();

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

      // Remove previously added prerequisite if one matches
      if ( alreadyListed.containsKey(sourceCapabilityId) ) {
        int previousIndex = alreadyListed.get(sourceCapabilityId);
        grantPath.remove(previousIndex);

        // Remove previously stored index of capability
        alreadyListed.remove(sourceCapabilityId);

        // Shift remembered indexes, now that grantList has been shifted
        Map<String,Integer> newAlreadyListed = new HashMap<String,Integer>();
        for ( Map.Entry<String,Integer> entry : alreadyListed.entrySet() ) {
          int newIndex = entry.getValue();
          if ( newIndex > previousIndex ) newIndex--;
          newAlreadyListed.put(entry.getKey(), newIndex);
        }
        alreadyListed = newAlreadyListed;
      }

      // Add capability to grant path, and remember index in case it's replaced
      Capability cap = (Capability) capabilityDAO.find(sourceCapabilityId);

      alreadyListed.put(sourceCapabilityId, grantPath.size());
      grantPath.add(cap);

      // Enqueue prerequisites for adding to grant path
      List prereqs = ( (ArraySink) prerequisiteDAO
        .where(EQ(CapabilityCapabilityJunction.SOURCE_ID, sourceCapabilityId))
        .select(new ArraySink()) ).getArray();
      for ( Object prereqObj : prereqs ) {
        CapabilityCapabilityJunction prereq =
          (CapabilityCapabilityJunction) prereqObj;
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
      {
        UserCapabilityJunction ucj = (UserCapabilityJunction)
          userCapabilityJunctionDAO.find(AND(associationPredicate,targetPredicate));
        if ( ucj != null ) {
          return ucj;
        }
      }

    } catch ( Exception e ) {
      Logger logger = (Logger) x.get("logger");
      logger.error("getJunction", capabilityId, e);
    }

    return null;
  }
}