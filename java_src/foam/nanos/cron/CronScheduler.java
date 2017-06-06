/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.cron;

import bsh.EvalError;
import bsh.Interpreter;
import foam.core.ContextAwareSupport;
import foam.core.Detachable;
import foam.core.FObject;
import foam.dao.*;
import foam.mlang.MLang;
import foam.mlang.sink.Min;
import foam.nanos.NanoService;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.Date;

public class CronScheduler
    extends    ContextAwareSupport
    implements NanoService
{
  protected MapDAO cronDAO_;

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

  /**
   * Runs a Cron job script
   *
   * @param cron the cron job to run
   * @return the updated cron job
   */
  private void runCronJob(Cron cron) {
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    PrintStream ps = new PrintStream(baos);
    Interpreter shell = new Interpreter();

    try {
      shell.set("currentCron", cron);
      cron.setOutput("");
      shell.setOut(ps);
      shell.eval(cron.getCode());
    } catch (EvalError e) {
      e.printStackTrace();
    }

    cron.setLastRun(new Date());
    ps.flush();
    cron.setOutput(baos.toString());
  }

  private final Thread cronJobs = new Thread() {
    @Override
    public void run() {
      try {
        while (true) {
          Date dtnow = new Date();
          ((AbstractDAO) cronDAO_.where(MLang.LTE(Cron.SCHEDULED_TIME, dtnow))).select(new AbstractSink() {
            @Override
            public void put(FObject obj, Detachable sub) {
              runCronJob((Cron) obj);
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
    cronDAO_ = (MapDAO) getX().get("MapDAO");
    cronJobs.start();
  }

  public static void main(String[] args) {
    Cron cron = new Cron()
        .setHour(23)
        .setMinute(59)
        .setMonth(6)
        .setDayOfWeek(6);
    System.out.println(cron.getNextScheduledTime());
  }
}
