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

import java.util.Date;

public class CronScheduler
    extends    ContextAwareSupport
    implements NanoService
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

  private final Thread cronJobs = new Thread() {
    @Override
    public void run() {
      try {
        while (true) {
          Date dtnow = new Date();
          cronDAO_.where(MLang.LTE(Cron.SCHEDULED_TIME, dtnow)).select(new AbstractSink() {
            @Override
            public void put(FObject obj, Detachable sub) {
              ((Cron) obj).runScript();
              cronDAO_.put(obj);
            }
          });

          Date minScheduledTime = getMinScheduledTime();
          Thread.sleep(minScheduledTime.getTime() - dtnow.getTime());
        }
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
    }
  };

  public void start() {
    cronDAO_ = (DAO) getX().get("MapDAO");
    cronJobs.start();
  }

  public static void main(String[] args) {
    Cron cron = new Cron()
        .setHour(23)
        .setMinute(59)
        .setDayOfMonth(8)
        .setMonth(6)
        .setDayOfWeek(0);
    System.out.println(cron.getScheduledTime());
    System.out.println(cron.getNextScheduledTime());
  }
}
