package foam.nanos.approval.test;

import foam.core.X;
import foam.nanos.approval.ApprovalStatus;
import foam.nanos.auth.LifecycleState;

public class ApprovalTestExecutorState {
  private ApprovalStatus status;
  private LifecycleState state;

  public ApprovalTestExecutorState(ApprovalStatus status, LifecycleState state) {
    this.status = status;
    this.state = state;
  }

  public ApprovalStatus getApprovalStatus() { return this.status; }
  public LifecycleState getLifecycleState() { return this.state; }
}
