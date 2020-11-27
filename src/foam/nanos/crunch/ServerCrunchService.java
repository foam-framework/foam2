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
import foam.nanos.crunch.lite.Capable;
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
          prereqsCache_.put(junction.getSourceId(), new ArrayList<>());
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
          var prereqGrantPath = this.getCapabilityPath(x, prereqs[i], filterGrantedUCJ);

          // Essentially we reserve arrays to denote  ANDs and ORs, must be at least 2  elements
          if ( prereqGrantPath.size() > 1 ) minMaxArray.add(prereqGrantPath);
          else if ( prereqGrantPath.size() == 1 ) minMaxArray.add(prereqGrantPath.get(0));
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
  
  public String[] getDependantIds(X x, String capabilityId) {
    return Arrays.stream(((CapabilityCapabilityJunction[]) ((ArraySink) ((DAO) x.get("prerequisiteCapabilityJunctionDAO"))
      .where(EQ(CapabilityCapabilityJunction.TARGET_ID, capabilityId))
      .select(new ArraySink())).getArray()
      .toArray(new CapabilityCapabilityJunction[0])))
      .map(CapabilityCapabilityJunction::getSourceId).toArray(String[]::new);
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

  public boolean hasPreconditionsMet(
    X x, String capabilityId
  ) {
    var preconditions = Arrays.stream(((CapabilityCapabilityJunction[]) ((ArraySink) ((DAO) x.get("prerequisiteCapabilityJunctionDAO"))
      .where(AND(
        EQ(CapabilityCapabilityJunction.SOURCE_ID, capabilityId),
        EQ(CapabilityCapabilityJunction.PRECONDITION, true)
      ))
      .select(new ArraySink())).getArray()
      .toArray(new CapabilityCapabilityJunction[0])))
      .map(CapabilityCapabilityJunction::getTargetId).toArray(String[]::new);
    
    for ( String preconditionId : preconditions ) {
      var ucj = getJunction(x, preconditionId);
      if ( ucj.getStatus() != CapabilityJunctionStatus.GRANTED ) return false;
    }

    return true;
  }

  public UserCapabilityJunction[] getAllJunctionsForUser(X x) {
    Predicate associationPredicate = getAssociationPredicate_(x);
    DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
    ArraySink arraySink = (ArraySink) userCapabilityJunctionDAO
      .where(associationPredicate)
      .select(new ArraySink());
    return (UserCapabilityJunction[]) arraySink.getArray().toArray(new UserCapabilityJunction[0]);
  }

  public UserCapabilityJunction getJunctionForSubject(
    X x, String capabilityId,  Subject subject
  ) {
    Predicate targetPredicate = EQ(UserCapabilityJunction.TARGET_ID, capabilityId);
    try {
      DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");

      x = x.put("subject", subject);
      Predicate associationPredicate = getAssociationPredicate_(x);

      // Check if a ucj implies the subject.realUser has this permission in relation to the user
      var ucj = (UserCapabilityJunction)
        userCapabilityJunctionDAO.find(AND(associationPredicate,targetPredicate));
      if ( ucj == null ) {
        ucj = buildAssociatedUCJ(x, capabilityId, subject);
      } else {
        ucj = (UserCapabilityJunction) ucj.fclone();
      }

      return ucj;
    } catch ( Exception e ) {
      Logger logger = (Logger) x.get("logger");
      logger.error("getJunction", capabilityId, e);

      // On failure, report that the capability is available
      var ucj = buildAssociatedUCJ(x, capabilityId, subject);
      return ucj;
    }
  }
  public UserCapabilityJunction updateJunction(
    X x, String capabilityId, FObject data,
    CapabilityJunctionStatus status
  ) {
    Subject subject = (Subject) x.get("subject");
    UserCapabilityJunction ucj = this.getJunction(x, capabilityId);
    if ( ucj.getStatus() == CapabilityJunctionStatus.AVAILABLE ) {
      ucj = buildAssociatedUCJ(x, capabilityId, subject);
    }
    if ( data != null ) {
      ucj.setData(data);
    }
    if ( status != null ) {
      ucj.setStatus(status);
    }

    if (
      subject.getRealUser().isAdmin()
      && subject.getRealUser() != subject.getUser()
    ) {
      var logger = (Logger) x.get("logger");
      // This may be correct when testing features as an admin user
      logger.warning(
        "admin user is lastUpdatedRealUser on an agent-associated UCJ");
    }
    ucj.setLastUpdatedRealUser(subject.getRealUser().getId());
    DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
    return (UserCapabilityJunction) userCapabilityJunctionDAO.inX(x).put(ucj);
  }

  public UserCapabilityJunction buildAssociatedUCJ(
    X x, String capabilityId, Subject subject
  ) {
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
    var ucj = isAssociation
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
    ucj.setStatus(CapabilityJunctionStatus.AVAILABLE);
    return ucj;
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
      CapabilityIntercept ex = new CapabilityIntercept(
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
    boolean topLevelRenewable = ucj != null && ucj.getStatus() == CapabilityJunctionStatus.GRANTED && ucj.getIsRenewable();

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
    CrunchService crunchService = (CrunchService) x.get("crunchService");
    List crunchPath = crunchService.getMultipleCapabilityPath(
      x, capabilityIds, false);

    List<CapablePayload> payloads = getCapableObjectPayloads(x, crunchPath);

    return payloads.toArray(new CapablePayload[payloads.size()]);
  }

  private List<CapablePayload> getCapableObjectPayloads(X x, List capabilities){
    List<CapablePayload> flattenedPayloads = new ArrayList<>();

    Capability rootCapability = (Capability) capabilities.get(capabilities.size() - 1);

    boolean isOr = capabilities.get(capabilities.size() - 1) instanceof MinMaxCapability;

    for ( int i = 0 ; i < capabilities.size() - 1 ; i++ ){
      Object currentObject = capabilities.get(i);

      if ( currentObject instanceof List ){
        List<CapablePayload> recursedPayloads = getCapableObjectPayloads(x, (List) currentObject);

        if ( isOr && recursedPayloads.size() > 1 ){
          CapablePayload recursedPayloadRoot = recursedPayloads.get(recursedPayloads.size() - 1);

          List<CapablePayload> recursedPayloadChildren = recursedPayloads.subList(0, recursedPayloads.size() - 1);

          recursedPayloadRoot.setPrerequisites(recursedPayloadChildren.toArray(new CapablePayload[0]));

          flattenedPayloads.add(recursedPayloadRoot);
        } else {
          flattenedPayloads.addAll(recursedPayloads);
        }
        continue;
      }

      if ( ! (currentObject instanceof Capability) ){
        throw new RuntimeException(
          "Expected capability or list"
        );
      }

      Capability payloadCapability = (Capability) capabilities.get(i);

      CapablePayload currentPayload = new CapablePayload.Builder(x)
        .setCapability(payloadCapability.getId())
        .build();

      flattenedPayloads.add(currentPayload);
    }

    List<CapablePayload> outputPayloads;
    CapablePayload rootPayload = new CapablePayload.Builder(x)
      .setCapability(rootCapability.getId())
      .build();

    if ( isOr ){
      outputPayloads = new ArrayList<>();

      rootPayload.setPrerequisites(flattenedPayloads.toArray(new CapablePayload[0]));

    } else {
      outputPayloads = flattenedPayloads;
    }

    outputPayloads.add(rootPayload);

    return outputPayloads;
  }

  private Predicate getAssociationPredicate_(X x) {
    Subject subject = (Subject) x.get("subject");

    User user = subject.getUser();
    User realUser = subject.getRealUser();

    Predicate acjPredicate = INSTANCE_OF(AgentCapabilityJunction.class);

    return OR(
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
  }
}
