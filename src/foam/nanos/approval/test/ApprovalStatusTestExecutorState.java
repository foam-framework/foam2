package foam.nanos.approval.test;

import foam.core.X;
import foam.nanos.approval.ApprovalStatus;

public class ApprovalStatusTestExecutorState {
  private ApprovalStatus status;
  private boolean isInitiatingUser;

  public ApprovalStatusTestExecutorState(ApprovalStatus status, boolean isInitiatingUser) {
    this.status = status;
    this.isInitiatingUser = isInitiatingUser;
  }

  public ApprovalStatus getApprovalStatus() { return this.status; }
  public boolean getIsInitiatingUser() { return this.isInitiatingUser; }
}
