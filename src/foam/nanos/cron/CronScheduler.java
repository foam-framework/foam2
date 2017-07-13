/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.cron;

import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.core.FObject;
import foam.dao.DAO;
import foam.dao.AbstractDAO;
import foam.dao.AbstractSink;
import foam.dao.MapDAO;
import foam.mlang.MLang;
import foam.mlang.sink.Min;
import foam.nanos.NanoService;
import foam.nanos.logger.NanoLogger;
import foam.nanos.pm.PM;

import java.util.Date;

public class CronScheduler
    extends    ContextAwareSupport
    implements NanoService, Runnable
{
  protected DAO cronDAO_;

  /**
   * Gets the minimum scheduled cron job
   *
   * @return Date of the minimum scheduled cron job
   */
  private Date getMinScheduledTime() {
    Min min = (Min) MLang.MIN(Cron.SCHEDULED_TIME);
    cronDAO_.select(min);
    return ((Cron) min.getValue()).getScheduledTime();
  }

  public void start() {
    cronDAO_ = (DAO) getX().get("cronDAO");
    new Thread(this).start();
  }

  @Override
  public void run() {
    NanoLogger logger = (NanoLogger) getX().get("logger");
    final PM pm = new PM(this.getClass(), "cronScheduler");

    try {
      while ( true ) {
        Date now = new Date();
        cronDAO_.where(MLang.LTE(Cron.SCHEDULED_TIME, now)).select(new AbstractSink() {
          @Override
          public void put(FObject obj, Detachable sub) {
            ((Cron) obj).runScript(CronScheduler.this.getX());
            cronDAO_.put(obj);
            pm.log(getX());
          }
        });

        Date minScheduledTime = getMinScheduledTime();
        Thread.sleep(minScheduledTime.getTime() - now.getTime());
      }
    } catch (InterruptedException e) {
      logger.error(this.getClass(), e.getMessage());
    }
  }
}