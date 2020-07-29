package foam.nanos.crunch;

import foam.dao.DAO;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Queue;

public class JavaCrunchService implements CrunchService {
  public List getGrantPath(X x, String rootId) {
    DAO prerequisiteDAO = (DAO) x.get("prerequisiteCapabilityJunctionDAO");
    DAO capabilityDAO = (DAO) x.get("capabilityDAO");

    // Lookup for indices of previously observed capabilities
    Map<String,Integer> alreadyListed = new HashMap<String,Integer>();
    // Return list (list is reversed at the end to put prerequisites first)
    List grantPath = new List<>();

    Queue<String> nextSources = new ArrayDeque<String>();
    nextSources.add(rootId)

    for ( int i = 0 ; i < nextSources.size() ; i++ ) {
      String sourceId = nextSources.poll();

      // Remove previously added prerequisite if one matches
      if ( alreadyListed.containsKey(sourceId) ) {
        int previousIndex = alreadyListed.get(sourceId);
        grantPath.remove(previousIndex);

        // Remove previously stored index of capability
        alreadyListed.remove(sourceId);

        // Shift remembered indexes, now that grantList has been shifted
        Map<String,Integer> newAlreadyListed = new HashMap<String,Integer>();
        for ( Map.Entry<String,Integer> entry : alreadyListed ) {
          int newIndex = entry.getValue();
          if ( newIndex > previousIndex ) newIndex--;
        }
      }

      // Add capability to grant path, and remember index in case it's replaced
      Capability cap = (Capability) capabilityDAO.find(sourceId);
      alreadyListed.set(sourceId, grantPath.size());
      grantPath.add(cap);

      // Enqueue prerequisites for adding to grant path
      List prereqs = prerequisiteDAO
        .where(MLang.EQ(CapabilityCapabilityJunction.SOURCE_ID, sourceId))
        .select(new ArraySink())
        .getArray();
      for ( CapabilityCapabilityJunction prereq : prereqs ) {
        nextSources.put(prereq);
      }
    }

    Collections.reverse(grantPath);
    return grantPath;
  }
}