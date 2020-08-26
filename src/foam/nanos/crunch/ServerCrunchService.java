/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.crunch;

import foam.core.FObject;
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
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.Queue;
import static foam.mlang.MLang.*;

public class ServerCrunchService implements CrunchService {
  public List getGrantPath(X x, String rootId) {
    return getCapabilityPath(x, rootId, true);
  }

  public List getCapabilityPath(X x, String rootId, boolean filterGrantedUCJ) {
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

      if ( ! filterGrantedUCJ ) {
        UserCapabilityJunction ucj = crunchService.getJunction(x, sourceCapabilityId);
        if ( ucj != null && ucj.getStatus() == CapabilityJunctionStatus.GRANTED ) {
          continue;
        }
      }

      if ( alreadyListed.contains(sourceCapabilityId) ) continue;

      // Add capability to grant path, and remember index in case it's replaced
      Capability cap = (Capability) capabilityDAO.find(sourceCapabilityId);

      alreadyListed.add(sourceCapabilityId);

      if ( cap instanceof MinMaxCapability && ! rootId.equals(sourceCapabilityId) ) {
        grantPath.add(this.getGrantPath(x, sourceCapabilityId));
        continue;
      }
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

  // Return capability path for multiple prerequisites without duplicates.
  public List getMultipleCapabilityPath(
    X x, String[] capabilityIds, boolean filterGrantedUCJ
  ) {
    Set alreadyListed = new HashSet<String>();

    List multiplePath = new ArrayList();

    for ( String capId : capabilityIds ) {
      List crunchyPath = getCapabilityPath(x, capId, filterGrantedUCJ);
      for ( Object obj : crunchyPath ) {
        Capability cap = null;
        if ( obj instanceof List ) {
          List list = (List) obj;
          cap = (Capability) list.get(list.size() - 1);
        } else {
          cap = (Capability) obj;
        }
        if ( alreadyListed.contains(cap.getId()) ) continue;
        multiplePath.add(obj);
      }
    }

    return multiplePath;
  }

  public UserCapabilityJunction getJunction(X x, String capabilityId) {
    Subject subject = (Subject) x.get("subject");
    return this.getJunctionForSubject(x, capabilityId, subject);
  }

  public UserCapabilityJunction getJunctionForSubject(
    X x, String capabilityId,  Subject subject
  ) {
    User user = subject.getUser();
    User realUser = subject.getRealUser();

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
  public void updateJunction(X x, String capabilityId, FObject data) {
    Subject subject = (Subject) x.get("subject");
    UserCapabilityJunction ucj = this.getJunction(x, capabilityId);
    if ( ucj == null ) {
      // Need Capability to associate UCJ correctly
      DAO capabilityDAO = (DAO) x.get("capabilityDAO");
      Capability cap = (Capability) capabilityDAO.find(capabilityId);
      if ( cap == null ) {
        throw new RuntimeException(String.format(
          "Capability with id '%s' not found", capabilityId
        ));
      }
      AssociatedEntity associatedEntity = cap.getAssociatedEntity();
      boolean isAssociation = associatedEntity == AssociatedEntity.ACTING_USER;
      User associatedUser = associatedEntity == AssociatedEntity.USER
        ? subject.getUser()
        : subject.getRealUser()
        ;
      ucj = isAssociation
        ? new AgentCapabilityJunction.Builder(x)
          .setSourceId(associatedUser.getId())
          .setTargetId(capabilityId)
          .setEffectiveUser(subject.getUser().getId())
          .build()
        : new UserCapabilityJunction.Builder(x)
          .setSourceId(associatedUser.getId())
          .setTargetId(capabilityId)
          .build()
        ;
    }
    if ( data != null ) {
      ucj.setData(data);
    }
    DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
    userCapabilityJunctionDAO.inX(x).put(ucj);
  }

  public void maybeIntercept(X x, String[] capabilityOptions) {
    if ( capabilityOptions.length < 1 ) {
      Logger logger = (Logger) x.get("logger");
      logger.warning("crunchService.maybeIntercept() performed with empty list");
      return;
    }

    // Check that at least one capability option is satisfied
    boolean satisfied = false;
    for ( String capId : capabilityOptions ) {
      UserCapabilityJunction ucj = this.getJunction(x, capId);
      if ( ucj != null && (
        // TODO: use getStatus().getBroadStatus() when available
        ucj.getStatus() == CapabilityJunctionStatus.GRANTED
        || ucj.getStatus() == CapabilityJunctionStatus.GRACE_PERIOD
      ) ) {
        satisfied = true;
        break;
      }
    }

    // Throw a capability intercept if none were satisfied
    if ( ! satisfied ) {
      CapabilityRuntimeException ex = new CapabilityRuntimeException(
        "Missing a required capability."
      );
      for ( String capId : capabilityOptions ) {
        ex.addCapabilityId(capId);
      }
      throw ex;
    }
  }
}
