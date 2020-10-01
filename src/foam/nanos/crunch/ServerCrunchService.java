/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.crunch;

import foam.core.*;
import foam.dao.AbstractSink;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.predicate.Predicate;
import foam.mlang.sink.GroupBy;
import foam.nanos.NanoService;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.crunch.lite.CapablePayload;
import foam.nanos.logger.Logger;
import foam.nanos.pm.PM;

import java.lang.Exception;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import static foam.mlang.MLang.*;

public class ServerCrunchService extends ContextAwareSupport implements CrunchService, NanoService {
  private Map<String, List<String>> prereqsCache_ = null;

  @Override
  public void start() throws Exception {
    var dao = (DAO) getX().get("prerequisiteCapabilityJunctionDAO");
    var updateSink = new AbstractSink() {
      public void put(Object obj, Detachable sub) {
        var junction = (CapabilityCapabilityJunction) obj;
        if ( getPrereqs(junction.getSourceId()) == null ) {
          prereqsCache_.put(junction.getSourceId(), new ArrayList());
        }
        getPrereqs(junction.getSourceId()).add(junction.getTargetId());
      }

      public void remove(Object obj, Detachable sub) {
        var junction = (CapabilityCapabilityJunction) obj;
        if ( getPrereqs(junction.getSourceId()) != null ) {
          getPrereqs(junction.getSourceId()).remove(junction.getTargetId());
        }
      }

      public void reset(Detachable sub) { prereqsCache_ = null; }
    };
    dao.listen(updateSink, null);
  }

  public List getGrantPath(X x, String rootId) {
    return getCapabilityPath(x, rootId, true);
  }

  public List getCapabilityPath(X x, String rootId, boolean filterGrantedUCJ) {
    Logger logger = (Logger) x.get("logger");
    PM pm = PM.create(x, this.getClass().getSimpleName(), "getCapabilityPath");

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

      if ( filterGrantedUCJ ) {
        UserCapabilityJunction ucj = getJunction(x, sourceCapabilityId);
        if ( ucj != null && ucj.getStatus() == CapabilityJunctionStatus.GRANTED ) {
          continue;
        }
      }

      if ( alreadyListed.contains(sourceCapabilityId) ) continue;

      // Add capability to grant path, and remember index in case it's replaced
      Capability cap = (Capability) capabilityDAO.find(sourceCapabilityId);

      // Skip missing capability
      if ( cap == null ) {
        continue;
      }
      alreadyListed.add(sourceCapabilityId);
      var prereqs = getPrereqs(sourceCapabilityId) == null ? new String[0] :
        getPrereqs(sourceCapabilityId).stream()
          .filter(c -> ! alreadyListed.contains(c))
          .toArray(String[]::new);

      if ( cap instanceof MinMaxCapability && ! rootId.equals(sourceCapabilityId) ) {
        List minMaxArray = new ArrayList<>();

        // Manually grab the direct  prereqs to the  MinMaxCapability
        for ( int i = prereqs.length - 1 ; i >= 0 ; i-- ) {
          var prereqGrantPath = this.getGrantPath(x, prereqs[i]);

          // Essentially we reserve arrays to denote  ANDs and ORs, must be at least 2  elements
          if ( prereqGrantPath.size() > 1 ) minMaxArray.add(prereqGrantPath);
          else minMaxArray.add(prereqGrantPath.get(0));
        }

        /**
            Format of a min max for getGrantPath
            [[prereqsChoiceA, choiceA], [prereqsChoiceB,choiceB], minMaxCapa]
         */
        minMaxArray.add(cap);

        /**
            Format of a min max for getGrantPath as a prereq for another  capability
            [[[prereqsChoiceA, choiceA], [prereqsChoiceB,choiceB], minMaxCap],cap]
         */
        grantPath.add(minMaxArray);

        continue;
      }
      grantPath.add(cap);

      // Enqueue prerequisites for adding to grant path
      for ( int i = prereqs.length - 1 ; i >= 0 ; i-- ) {
        nextSources.add(prereqs[i]);
      }
    }

    Collections.reverse(grantPath);
    pm.log(x);
    return grantPath;
  }

  public synchronized List<String> getPrereqs(String capId) {
    if ( prereqsCache_ == null ) {
      prereqsCache_ = new ConcurrentHashMap<>();
      var dao = (DAO) getX().get("prerequisiteCapabilityJunctionDAO");
      var sink = (GroupBy) dao.select(
        GROUP_BY(
          CapabilityCapabilityJunction.SOURCE_ID,
          MAP(
            CapabilityCapabilityJunction.TARGET_ID,
            new ArraySink()
          )
        )
      );

      for (var key : sink.getGroupKeys()) {
        prereqsCache_.put(key.toString(), ((ArraySink) ((foam.mlang.sink.Map)
          sink.getGroups().get(key)).getDelegate()).getArray());
      }
    }
    return prereqsCache_.get(capId);
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
      if ( ucj != null && ucj.getStatus() == CapabilityJunctionStatus.GRANTED ) {
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

  public boolean isRenewable(X x, String capabilityId) {
    DAO capabilityDAO = (DAO) x.get("capabilityDAO");
    CrunchService crunchService = (CrunchService) x.get("crunchService");

    Capability capability = (Capability) capabilityDAO.find(capabilityId);
    UserCapabilityJunction ucj = crunchService.getJunction(x, capabilityId);
      if ( ! capability.getEnabled() ) return false;

    var prereqs = getPrereqs(capabilityId);
    boolean topLevelRenewable = ucj.getStatus() == CapabilityJunctionStatus.GRANTED && ucj.getIsRenewable();

    if ( prereqs == null || prereqs.size() == 0 || topLevelRenewable ) return topLevelRenewable;

    for ( var capId : prereqs ) {
      if ( isRenewable(x, capId.toString())  ) return true;
    }
    return false;
  }

  public boolean maybeReopen(X x, String capabilityId) {
    DAO capabilityDAO = (DAO) x.get("capabilityDAO");
    CrunchService crunchService = (CrunchService) x.get("crunchService");

    Capability capability = (Capability) capabilityDAO.find(capabilityId);
    UserCapabilityJunction ucj = crunchService.getJunction(x, capabilityId);
      if ( ! capability.getEnabled() ) return false;

    var prereqs = getPrereqs(capabilityId);
    boolean shouldReopenTopLevel = shouldReopenUserCapabilityJunction(ucj);

    if ( prereqs == null || prereqs.size() == 0 || shouldReopenTopLevel ) return shouldReopenTopLevel;

    for ( var capId : prereqs ) {
      if ( maybeReopen(x, capId.toString())  ) return true;
    }
    return false;
  }

  public boolean shouldReopenUserCapabilityJunction(UserCapabilityJunction ucj) {
    if ( ucj == null ) return true;
    else if ( ucj.getStatus() == CapabilityJunctionStatus.GRANTED && ucj.getIsRenewable() ) return true;
    else if ( ucj.getStatus() != CapabilityJunctionStatus.GRANTED && 
              ucj.getStatus() != CapabilityJunctionStatus.PENDING && 
              ucj.getStatus() != CapabilityJunctionStatus.APPROVED ) return true;
    return false;
  }

  public CapablePayload[] getCapableObjectPayloads(X x, String[] capabilityIds) {
    List<CapablePayload> payloads = new ArrayList<>();

    CrunchService crunchService = (CrunchService) x.get("crunchService");
    List crunchPath = crunchService.getMultipleCapabilityPath(
      x, capabilityIds, false);

    for ( Object obj : crunchPath ) {
      if ( ! (obj instanceof Capability) ) {
        // Lists correspond to capabilityIds with their own prerequisite
        // logic, such as MinMaxCapability. Clients will need to be
        // made aware of these capabilities separately.
        if ( obj instanceof List ) {
          List list = (List) obj;

          // Add payload object prerequisites
          List prereqs = new ArrayList();
          for ( int i = 0 ; i < list.size() - 1 ; i++ ) {
            Capability prereqCap = (Capability) list.get(i);
            list.add(new CapablePayload.Builder(x)
              .setCapability(prereqCap)
              .build());
          }

          // Add payload object
          /* TODO: Figure out why this is an error when adding
                    support for MinMaxCapability
          Capability cap = (Capability) list.get(list.size() - 1);
          payloads.add(new CapablePayload.Builder(x)
            .setCapability(cap)
            .setPrerequisites(prereqs.toArray(
              new CapablePayload[list.size()]))
            .build());
          */
          continue;
        }

        throw new RuntimeException(
          "Expected capability or list");
      }
      Capability cap = (Capability) obj;
      payloads.add(new CapablePayload.Builder(x)
        .setCapability(cap)
        .build());
    }
    
    // Re-FObjectArray
    return payloads.toArray(new CapablePayload[payloads.size()]);
  }
}
