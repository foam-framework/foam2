/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.cron;

import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.core.FObject;
import foam.dao.AbstractDAO;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.dao.MapDAO;
import foam.mlang.MLang;
import foam.mlang.sink.Min;
import foam.nanos.logger.Logger;
import foam.nanos.NanoService;
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
    Min min = (Min) cronDAO_
      .where(MLang.EQ(Cron.ENABLED, true))
      .select(MLang.MIN(Cron.SCHEDULED_TIME));

    if ( min.getValue().equals(0) ) {
      return null;
    }

    return (Date) min.getValue();
  }

  public void start() {
    cronDAO_ = (DAO) getX().get("cronDAO");

    new Thread(this).start();
  }

  @Override
  public void run() {
    final Logger logger = (Logger) getX().get("logger");

    try {
      while ( true ) {
        Date now = new Date();

        cronDAO_.where(
          MLang.AND(
            MLang.LTE(Cron.SCHEDULED_TIME, now),
            MLang.EQ(Cron.ENABLED, true)
          )
        ).select(new AbstractSink() {
          @Override
          public void put(Object obj, Detachable sub) {
            Cron cron = (Cron) ((FObject) obj).fclone();

            PM pm = new PM(CronScheduler.class, "cron:" + cron.getId());
            try {
              cron.runScript(CronScheduler.this.getX());
            } catch (Throwable t) {
              logger.error(this.getClass(), "Error running Cron Job", cron.getId(), t.getMessage(), t);
            } finally {
              pm.log(getX());
            }
            cronDAO_.put((FObject) cron);
          }
        });

        Date minScheduledTime = getMinScheduledTime();
        // Check for new cronjobs every 5 seconds if no current jobs
        // or if their next scheduled execution time is > 5s away
        if( minScheduledTime == null ) {
          Thread.sleep(5000);
        } else {
          long delay = minScheduledTime.getTime() - System.currentTimeMillis();
          if ( delay > 5000 ) {
            delay = 5000;
          } else if ( delay < 0 ) {
            // Delay at least a little bit to avoid blocking in case of a
            // script error.
            delay = 500;
          }
          Thread.sleep(delay);
        }
      }
    } catch (Throwable t) {
      logger.error(this.getClass(), t.getMessage());
    }
  }
}
