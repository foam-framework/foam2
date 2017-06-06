/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.cron;

import foam.core.ContextAwareSupport;
import foam.dao.MapDAO;
import foam.nanos.NanoService;

import java.util.Date;

public class CronScheduler
  extends    ContextAwareSupport
  implements NanoService
{
  protected MapDAO cronDAO_;

  private void getMinScheduledCronJob() {


  }

  public void runCronJob(Cron cron) {

  }

  public void runAllCronJobs() {

  }

  public void start() {
    cronDAO_ = (MapDAO) getX().get("MapDAO");
  }
}
