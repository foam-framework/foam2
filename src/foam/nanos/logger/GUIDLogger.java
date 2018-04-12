/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.logger;

import java.util.Date;
import java.util.Random;

import foam.core.*;
import foam.dao.DAO;

public class GUIDLogger
  extends AbstractLogger
{
  private DAO logDAO_ = null;
  private Random r = new Random();
  public GUIDLogger(X x) {
    logDAO_ = (DAO) x.get("logDAO");
  }

  private FObject generateLogModel(String type, Object... args) {
    Date d = new Date();
    Log log = new Log();
    log.setId(Long.toString(d.getTime()) + "-" + Integer.toString(r.nextInt(100000), 5));
    log.setTime(new Date());
    log.setFrom("BackEnd");
    log.setBelong(System.getProperty("user.name"));
    log.setType(type);
    log.setDescription(args[0].toString());
    log.setDetail(combine(args));
    return log;
  }

  public void log(Object... args) {
    logDAO_.put(generateLogModel("log", args));
  }

  public void info(Object... args) {
    logDAO_.put(generateLogModel("info", args));
  }

  public void warning(Object... args) {
    logDAO_.put(generateLogModel("warning", args));
  }

  public void error(Object... args) {
    logDAO_.put(generateLogModel("error", args));
  }

  public void debug(Object... args) {
    logDAO_.put(generateLogModel("debug", args));
  }
}