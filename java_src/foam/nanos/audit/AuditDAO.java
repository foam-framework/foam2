package foam.nanos.audit;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.dao.ProxyDAO;
import foam.lib.json.JSONParser;
import foam.lib.json.Outputter;
import foam.nanos.auth.User;
import foam.nanos.logger.NanoLogger;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

public class AuditDAO
  extends ProxyDAO
{
  private final Outputter outputter = new Outputter();

  /**
   * Creates a format message containing the
   * list of properties that have changed
   *
   * @param currentValue current value
   * @param newValue new value
   * @return String array of changes
   */
  private String formatMessage(FObject currentValue, FObject newValue) {
    Map diff = currentValue.diff(newValue);
    Iterator i = diff.keySet().iterator();

    List<String> result = new ArrayList<>();
    while ( i.hasNext() ) {
      String key = (String) i.next();
      PropertyInfo prop = (PropertyInfo) currentValue.getClassInfo().getAxiomByName(key);
      result.add(key + ": [" + prop.f(currentValue) + "," + diff.get(key) + "]");
    }
    return result.toString();
  }


  @Override
  public FObject put_(FObject obj) {
    // TODO: use context-oriented context when available.
    User user = (User) getX().get("user");
    NanoLogger logger = (NanoLogger) getX().get("logger");
    FObject current = this.find_(obj);
    Object objectId = ((PropertyInfo) obj.getClassInfo().getAxiomByName("id")).f(obj);
    logger.info("CHANGE", objectId, user.getId(), formatMessage(current, obj));
    return super.put_(obj);
  }

  @Override
  public FObject remove_(FObject obj) {
    // TODO: use context-oriented context when available.
    User user = (User) getX().get("user");
    NanoLogger logger = (NanoLogger) getX().get("logger");
    StringBuilder sb = new StringBuilder();
    outputter.output(sb, obj);
    Object objectId = ((PropertyInfo) obj.getClassInfo().getAxiomByName("id")).f(obj);
    logger.info("REMOVE", objectId, user.getId(), sb);
    return super.remove_(obj);
  }
}
