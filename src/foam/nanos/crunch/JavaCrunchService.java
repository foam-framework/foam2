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
    // Return list (list is reversed at the end to put prerequisites first)
    List grantPath = new ArrayList<>();

    Queue<String> nextSources = new ArrayDeque<String>();
    nextSources.add(rootId);

    // Doing this instead of "this" could prevent unexpected behaviour
    // in the incident CrunchService's getJunction method is decorated
    CrunchService crunchService = (CrunchService) x.get("crunchService");

    while ( nextSources.size() > 0 ) {
      String sourceId = nextSources.poll();

      UserCapabilityJunction ucj = crunchService.getJunction(x, sourceId);
      if ( ucj != null && ucj.getStatus() == CapabilityJunctionStatus.GRANTED ) {
        continue;
      }

      // Remove previously added prerequisite if one matches
      if ( alreadyListed.containsKey(sourceId) ) {
        int previousIndex = alreadyListed.get(sourceId);
        grantPath.remove(previousIndex);

        // Remove previously stored index of capability
        alreadyListed.remove(sourceId);

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
      Capability cap = (Capability) capabilityDAO.find(sourceId);

      alreadyListed.put(sourceId, grantPath.size());
      grantPath.add(cap);

      // Enqueue prerequisites for adding to grant path
      List prereqs = ( (ArraySink) prerequisiteDAO
        .where(EQ(CapabilityCapabilityJunction.SOURCE_ID, sourceId))
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

      if ( user != realUser ) {
        // Check if a ucj implies the subject.user has this permission
        Predicate userPredicate = AND(
          NOT(acjPredicate),
          EQ(UserCapabilityJunction.SOURCE_ID, user.getId())
        );
        UserCapabilityJunction ucj = (UserCapabilityJunction)
          userCapabilityJunctionDAO.find(AND(userPredicate,targetPredicate));
        if ( ucj != null ) {
          return ucj;
        }
      }

      // Check if a ucj implies the subject.realUser has this permission
      {
        Predicate userPredicate = AND(
          NOT(acjPredicate),
          EQ(UserCapabilityJunction.SOURCE_ID, realUser.getId())
        );
        UserCapabilityJunction ucj = (UserCapabilityJunction)
          userCapabilityJunctionDAO.find(AND(userPredicate,targetPredicate));
        if ( ucj != null ) {
          return ucj;
        }
      }

      // Check if a ucj implies the subject.realUser has this permission in relation to the user
      {
        Predicate userPredicate = AND(
          acjPredicate,
          EQ(UserCapabilityJunction.SOURCE_ID, realUser.getId()),
          EQ(AgentCapabilityJunction.EFFECTIVE_USER, user.getId())
        );
        UserCapabilityJunction ucj = (UserCapabilityJunction)
          userCapabilityJunctionDAO.find(AND(userPredicate,targetPredicate));
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