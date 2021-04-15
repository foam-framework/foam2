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
import foam.dao.ProxySink;
import foam.dao.Sink;
import foam.mlang.predicate.Predicate;
import foam.mlang.sink.GroupBy;
import foam.nanos.NanoService;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.auth.AuthService;
import foam.nanos.crunch.lite.Capable;
import foam.nanos.crunch.CapabilityJunctionPayload;
import foam.nanos.crunch.ui.PrerequisiteAwareWizardlet;
import foam.nanos.crunch.ui.WizardState;
import foam.nanos.logger.Logger;
import foam.nanos.pm.PM;
import foam.nanos.session.Session;
import java.lang.Exception;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import static foam.mlang.MLang.*;
import static foam.nanos.crunch.CapabilityJunctionStatus.*;

public class ServerCrunchService extends ContextAwareSupport implements CrunchService, NanoService {
  public static String CACHE_KEY = "CrunchService.PrerequisiteCache";

  @Override
  public void start() { }

  public List getGrantPath(X x, String rootId) {
    return getCapabilityPath(x, rootId, true);
  }

  //TODO: Needs to be refactored once Subject is serializable
  public List getCapabilityPathFor(X x, String rootId, boolean filterGrantedUCJ, User effectiveUser, User user) {
    foam.nanos.auth.AuthService auth = (foam.nanos.auth.AuthService) x.get("auth");
    if ( auth.check(x, "service.crunchService.getCapabilityPathFor") ) {
      var requestedSubject = new Subject();
      requestedSubject.setUser(user);
      requestedSubject.setUser(effectiveUser);
      x = x.put("subject", requestedSubject);
    }
    return this.getCapabilityPath(x, rootId, filterGrantedUCJ);
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
        if ( ucj != null && ucj.getStatus() == CapabilityJunctionStatus.GRANTED 
          && ! maybeReopen(x, ucj.getTargetId()) 
        ) {
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
      var prereqsList = getPrereqs(x, sourceCapabilityId, null);
      var prereqs = prereqsList == null ? new String[0] : prereqsList.stream()
          .filter(c -> ! alreadyListed.contains(c))
          .toArray(String[]::new);

      var prereqAware = cap.getWizardlet() instanceof PrerequisiteAwareWizardlet || (
        cap.getBeforeWizardlet() != null &&
        cap.getBeforeWizardlet() instanceof PrerequisiteAwareWizardlet
      );
      if ( prereqAware && ! rootId.equals(sourceCapabilityId) ) {
        List minMaxArray = new ArrayList<>();

        // Manually grab the direct  prereqs to the  MinMaxCapability
        for ( int i = prereqs.length - 1 ; i >= 0 ; i-- ) {
          var prereqGrantPath = this.getCapabilityPath(x, prereqs[i], filterGrantedUCJ);
          
          // remove prereqs that are already listed
          prereqGrantPath.removeIf(c -> {
            if (  c instanceof List ){
              return false;
            }       
            return alreadyListed.contains(((Capability) c).getId());
          });

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

  public String[] getDependentIds(X x, String capabilityId) {
    return Arrays.stream(((CapabilityCapabilityJunction[]) ((ArraySink) ((DAO) x.get("prerequisiteCapabilityJunctionDAO"))
      .inX(x)
      .where(EQ(CapabilityCapabilityJunction.TARGET_ID, capabilityId))
      .select(new ArraySink())).getArray()
      .toArray(new CapabilityCapabilityJunction[0])))
      .map(CapabilityCapabilityJunction::getSourceId).toArray(String[]::new);
  }

  // gets prereq list of a cap from the prereqsCache_
  // if cache returned is null, try to find prereqs directly from prerequisitecapabilityjunctiondao
  public synchronized List<String> getPrereqs(X x, String capId, UserCapabilityJunction ucj) {
    if ( ucj != null ) x = x.put("subject", ucj.getSubject(x));
    Map<String, List<String>> prereqsCache_ = getPrereqsCache(x);
    if ( prereqsCache_ != null ) return prereqsCache_.get(capId);

    return getPrereqs_(x, capId);
  } 

  // select all ccjs from pcjdao and put them into map of <src, [tgt]> pairs
  // then the map is stored in the session context under CACHE_KEY
  public Map initCache(X x) {
    Session session = x.get(Session.class);
    Sink purgeSink = new Sink() {
      public void put(Object obj, Detachable sub) {
        updateEntry(x, (CapabilityCapabilityJunction) obj);
      }
      public void remove(Object obj, Detachable sub) {
        updateEntry(x, (CapabilityCapabilityJunction) obj);
      }
      public void reset(Detachable sub) {
        purgeCache(x);
      }
      public void eof() {}
    };
    ((DAO) x.get("prerequisiteCapabilityJunctionDAO")).listen(purgeSink, TRUE);
    Map map = new ConcurrentHashMap<String, List<String>>();
    var dao = ((DAO) x.get("prerequisiteCapabilityJunctionDAO")).inX(x);
    var sink = (GroupBy) dao.
      orderBy(CapabilityCapabilityJunction.PRIORITY).
      select(
        GROUP_BY(
          CapabilityCapabilityJunction.SOURCE_ID,
          MAP(
            CapabilityCapabilityJunction.TARGET_ID,
            new ArraySink()
          )
        )
      );
    for (var key : sink.getGroupKeys()) {
      map.put(key.toString(), ((ArraySink) ((foam.mlang.sink.Map)
        sink.getGroups().get(key)).getDelegate()).getArray());
    }
    session.setContext(session.getContext().put(CACHE_KEY, map));
    return map;
  }

  // returns a getPrereqs result directly from prerequisitecapabilityjunctiondao
  public synchronized List<String> getPrereqs_(X x, String capId) {
    return ((ArraySink) ((foam.mlang.sink.Map) ((DAO) x.get("prerequisiteCapabilityJunctionDAO"))
      .inX(x)
      .where(EQ(CapabilityCapabilityJunction.SOURCE_ID, capId))
      .orderBy(CapabilityCapabilityJunction.PRIORITY)
      .select(MAP(CapabilityCapabilityJunction.TARGET_ID, new ArraySink()))).getDelegate())
      .getArray();
  }
   
  // when an entry of ccj is added, updated, or removed from pcjdao, update corresponding entry in the cache
  public void updateEntry(X x, CapabilityCapabilityJunction ccj) {
    Session session = x.get(Session.class);
    if ( session == null ) return;
    // use the context of the session user/agent to recalculate the prereqs list for corresponding
    // entry in map
    DAO userDAO = (DAO) x.get("localUserDAO");
    User sessionUser = (User) userDAO.find(session.getUserId());
    User sessionAgent = session.getAgentId() > 0 ? (User) userDAO.find(session.getAgentId()) : null;

    Subject subject = sessionAgent == null ? new Subject(sessionUser) : new Subject(sessionAgent);
    if ( sessionAgent != null ) subject.setUser(sessionUser);

    Map<String, List<String>> cache = (Map) session.getContext().get(CACHE_KEY);
    cache.put(ccj.getSourceId(), getPrereqs_(x.put("subject", subject), ccj.getSourceId()));

    session.setContext(session.getContext().put(CACHE_KEY, cache));
  }

  // sets the prerequisite cache to null, is used when session info changes
  public static void purgeCache(X x) {
    Session session = x.get(Session.class);
    if ( session != null ){
      session.setContext(session.getContext().put(CACHE_KEY, null));
    }
  }


  // get pcj cache from session context. If the current context subject users match the user/agent
  // of session, return the cache. Or, if cache is empty, initialize the cache
  // otherwise, return the result of directly looking up prerequisitecapabilityjunctiondao since
  // the cache is not valid
  protected Map<String, List<String>> getPrereqsCache(X x) {
    Session session = x.get(Session.class);
    User user = ((Subject) x.get("subject")).getUser();
    if ( user == null ) {
      return initCache(x);
    }
    Long userId = user.getId();
    Long agentId = ((Subject) x.get("subject")).getRealUser().getId();

    boolean cacheValid = session.getAgentId() > 0 ?
      session.getAgentId() == agentId && session.getUserId() == userId :
      session.getUserId() == agentId && session.getUserId() == userId;

    // the cache belongs to the real user in the session, so if the current context user
    // is anything but, do not use it
    if ( ! cacheValid ) return null;

    Map<String, List<String>> map = (Map) session.getContext().get(CACHE_KEY);
    return map == null ? initCache(x) : map;
  }

  //TODO: Needs to be refactored once Subject is serializable
  public UserCapabilityJunction getJunctionFor(X x, String capabilityId, User effectiveUser, User user) {
    Subject subject = (Subject) x.get("subject");
    foam.nanos.auth.AuthService auth = (foam.nanos.auth.AuthService) x.get("auth");
    if ( auth.check(x, "service.crunchService.getJunctionFor") ) {
      var requestedSubject = new Subject();
      requestedSubject.setUser(user);
      requestedSubject.setUser(effectiveUser);
      return this.getJunctionForSubject(x, capabilityId, requestedSubject);
    }
    return this.getJunctionForSubject(x, capabilityId, subject);
  }

  public UserCapabilityJunction getJunction(X x, String capabilityId) {
    Subject subject = (Subject) x.get("subject");
    return this.getJunctionForSubject(x, capabilityId, subject);
  }

  public boolean atLeastOneInCategory(X x, String category) {
    var categoryJunctionDAO = (DAO) x.get("capabilityCategoryCapabilityJunctionDAO");

    var junctions = new ArrayList<>();
    categoryJunctionDAO.where(EQ(CapabilityCategoryCapabilityJunction.SOURCE_ID, category))
    .select(new AbstractSink() {
      @Override
      public void put(Object obj, Detachable sub) {
        junctions.add(((CapabilityCategoryCapabilityJunction) obj).getTargetId());
      }
    });

    var ucj = (UserCapabilityJunction) ((DAO) x.get("userCapabilityJunctionDAO"))
      .find(AND(
          getAssociationPredicate_(x),
          IN(UserCapabilityJunction.TARGET_ID, junctions),
          EQ(UserCapabilityJunction.STATUS, CapabilityJunctionStatus.GRANTED)
        )
      );

    return ucj != null;
  }

  // see documentation in CrunchService interface
  public boolean hasPreconditionsMet(
    X sessionX, String capabilityId
  ) {
    // Return false if capability does not exist or is not available
    var capabilityDAO = ((DAO) sessionX.get("capabilityDAO")).inX(sessionX);
    if ( capabilityDAO.find(capabilityId) == null ) return false;

    // TODO: use MapSink to simplify/optimize this code
    var preconditions = Arrays.stream(((CapabilityCapabilityJunction[]) ((ArraySink) ((DAO) sessionX.get("prerequisiteCapabilityJunctionDAO"))
      .inX(sessionX)
      .where(AND(
        EQ(CapabilityCapabilityJunction.SOURCE_ID, capabilityId),
        EQ(CapabilityCapabilityJunction.PRECONDITION, true)
      ))
      .select(new ArraySink())).getArray()
      .toArray(new CapabilityCapabilityJunction[0])))
      .map(CapabilityCapabilityJunction::getTargetId).toArray(String[]::new);

    for ( String preconditionId : preconditions ) {
      // Return false if capability does not exist or is not available
      if ( capabilityDAO.find(preconditionId) == null ) return false;
      var ucj = getJunction(sessionX, preconditionId);
      if ( ucj.getStatus() != CapabilityJunctionStatus.GRANTED ) return false;
    }

    return true;
  }

  // see documentation in CrunchService interface
  public ArraySink getEntryCapabilities(X x) {
    var sink = new ArraySink();
    var proxySink = new ProxySink(x, sink) {
      @Override
      public void put(Object o, Detachable sub) {
        var cap = (Capability) o;
        if ( ! cap.getVisibilityPredicate().f(x) || ! hasPreconditionsMet(x, cap.getId()) ) {
          return;
        }
        getDelegate().put(o, sub);
      }
    };

    var capabilityDAO = ((DAO) x.get("capabilityDAO")).inX(x);
    capabilityDAO.select(proxySink);
    return sink;
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

    if ( ucj.getStatus() == AVAILABLE && status == null ) {
      ucj.setStatus(ACTION_REQUIRED);
    }

    if ( data != null ) {
      ucj.setData(data);
    }
    if ( status != null ) {
      ucj.setStatus(status);
    }

    AuthService auth = (AuthService) x.get("auth");
    if (
      auth.check(x, "usercapabilityjunction.warn.update")
      && subject.getRealUser() != subject.getUser()
    ) {
      var logger = (Logger) x.get("logger");
      // This may be correct when testing features as an admin user
      logger.warning(
        subject.getUser().toSummary() + " user is lastUpdatedRealUser on an agent-associated UCJ");
    }
    ucj.setLastUpdatedRealUser(subject.getRealUser().getId());
    DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
    return (UserCapabilityJunction) userCapabilityJunctionDAO.inX(x).put(ucj);
  }

  //TODO: Needs to be refactored once Subject is serializable
  public UserCapabilityJunction updateJunctionFor(
    X x, String capabilityId, FObject data,
    CapabilityJunctionStatus status, User effectiveUser, User user
  ) {
    Subject subject = (Subject) x.get("subject");
    foam.nanos.auth.AuthService auth = (foam.nanos.auth.AuthService) x.get("auth");
    if ( auth.check(x, "service.crunchService.updateJunctionFor") ) {
      var requestedSubject = new Subject();
      requestedSubject.setUser(user);
      requestedSubject.setUser(effectiveUser);
      return this.updateUserJunction(x, requestedSubject, capabilityId, data, status);
    }
    return this.updateUserJunction(x, subject, capabilityId, data, status);
  }

  public UserCapabilityJunction updateUserJunction(
    X x, Subject subject, String capabilityId, FObject data,
    CapabilityJunctionStatus status
  ) {
    UserCapabilityJunction ucj = this.getJunctionForSubject(
      x, capabilityId, subject);

    if ( data != null ) {
      ucj.setData(data);
    }
    if ( status != null ) {
      ucj.setStatus(status);
    }

    DAO userCapabilityJunctionDAO = (DAO) x.get("userCapabilityJunctionDAO");
    var subjectX = x.put("subject", subject);
    return (UserCapabilityJunction) userCapabilityJunctionDAO.inX(x).put(ucj);
  }

  public UserCapabilityJunction buildAssociatedUCJ(
    X x, String capabilityId, Subject subject
  ) {
    // Need Capability to associate UCJ correctly
    DAO capabilityDAO = (DAO) x.get("capabilityDAO");

    // If the subject in context doesn't have the capability availabile, we
    // should act as though it doesn't exist; this is why inX is here.
    Capability cap = (Capability) capabilityDAO.inX(x).find(capabilityId);
    if ( cap == null ) {
      throw new RuntimeException(String.format(
        "Capability with id '%s' is either unavailabile or does not exist",
        capabilityId
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

    var prereqs = getPrereqs(x, capabilityId, ucj);
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
    return capability.maybeReopen(x, ucj);
  }

  public WizardState getWizardState(X x, String capabilityId) {
    var subject = (Subject) x.get("subject");

    DAO capabilityDAO = (DAO) x.get("capabilityDAO");
    Capability capability = (Capability) capabilityDAO.find(capabilityId);

    if ( ! subject.isAgent() ) {
      return getWizardStateFor_(x, subject, capabilityId);
    }

    var realUser = new Subject();
    realUser.setUser(subject.getRealUser());
    realUser.setUser(subject.getRealUser());
    var realUserWizardState = getWizardStateFor_(x, realUser, capabilityId);
    var effectiveUser = new Subject();
    effectiveUser.setUser(subject.getUser());
    effectiveUser.setUser(subject.getUser());
    var userWizardState = getWizardStateFor_(x, effectiveUser, capabilityId);

    var subjectWizardState = getWizardStateFor_(x, subject, capabilityId);

    return capability.getAssociatedEntity() == AssociatedEntity.USER ? userWizardState : 
      capability.getAssociatedEntity() == AssociatedEntity.REAL_USER ? realUserWizardState :
      subjectWizardState;
  }

  private WizardState getWizardStateFor_(X x, Subject s, String capabilityId) {
    var wizardStateDAO = (DAO) x.get("wizardStateDAO");

    var wizardState = new WizardState.Builder(x)
      .setRealUser(s.getRealUser().getId())
      .setEffectiveUser(s.getUser().getId())
      .setCapability(capabilityId)
      .build();

    var wizardStateFind = wizardStateDAO.find(wizardState);

    if ( wizardStateFind != null ) return (WizardState) wizardStateFind;

    wizardState.setIgnoreList(getGrantedFor_(x, s, capabilityId));
    wizardStateDAO.put(wizardState);
    return wizardState;
  }

  private String[] getGrantedFor_(X x, Subject s, String capabilityId) {
    x = x.put("subject", s);
    var capsOrLists = getCapabilityPath(x, capabilityId, false);
    var granted = (List<String>) new ArrayList<String>();

    var grantedStatuses = new CapabilityJunctionStatus[] {
      CapabilityJunctionStatus.GRANTED,
      CapabilityJunctionStatus.PENDING,
      CapabilityJunctionStatus.APPROVED,
    };

    for ( Object obj : capsOrLists ) {
      Capability cap;
      boolean isPrereqAware = false;
      if ( obj instanceof List ) {
        isPrereqAware = true;
        var list = (List) obj;
        cap = (Capability) list.get(list.size() - 1);
      } else {
        cap = (Capability) obj;
      }

      try {
        var ucj = getJunction(x, cap.getId());
        if ( IN(UserCapabilityJunction.STATUS, grantedStatuses).f(ucj) ) {
          // if a minmax capability is in GRANTED status, its prerequisites should also be added
          // as a part of granted list, so the wizrd will know to ignore the prerequisites
          if ( isPrereqAware ) {
            for ( var c : (List) obj ) {
              granted.add(((Capability) c).getId());
            }
          }
          else granted.add(cap.getId());
        }
      } catch ( RuntimeException e ) {
        // This happens if getJunction was called with an unavailabile
        // capability, which is fine here.
      }
    }

    return granted.toArray(new String[0]);
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
