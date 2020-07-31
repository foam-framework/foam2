package foam.nanos.crunch;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
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
    DAO prerequisiteDAO = (DAO) x.get("prerequisiteCapabilityJunctionDAO");
    DAO capabilityDAO = (DAO) x.get("capabilityDAO");
    // TODO:
    // DAO junctionDAO

    // Lookup for indices of previously observed capabilities
    Map<String,Integer> alreadyListed = new HashMap<String,Integer>();
    // Return list (list is reversed at the end to put prerequisites first)
    List grantPath = new ArrayList<>();

    Queue<String> nextSources = new ArrayDeque<String>();
    nextSources.add(rootId);

    while ( nextSources.size() > 0 ) {
      String sourceId = nextSources.poll();

      // TODO:
      // UserCapabilityJunction ucj = (UserCapabilityJunction)

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
        }
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
}