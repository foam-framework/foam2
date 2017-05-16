package foam.nanos.pm;

import foam.core.X;

/**
* Created by nick on 15/05/17.
*/
public class PerformanceMonitor {

  private Class cls_;
  private String name_;
  private long startTime_;
  private long endTime_;

  public PerformanceMonitor(Class cls, String name) {
    cls_ = cls;
    name_ = name;
    startTime_ = System.nanoTime();
  }

  public void end(PerformanceLogger x) {
    if(x != null) {
      endTime_ = System.nanoTime();
      x.log(this);
    }
  }

  public Class getClassType() {
      return cls_;
  }

  public String getName() {
      return name_;
  }

  public long getStartTime() {
      return startTime_;
  }

  public long getTime() {
      return endTime_ - startTime_;
  }

}
