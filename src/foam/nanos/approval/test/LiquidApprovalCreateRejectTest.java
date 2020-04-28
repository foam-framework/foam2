package foam.nanos.approval.test;

import foam.core.X;
import foam.nanos.approval.ApprovalStatus;
import foam.nanos.auth.LifecycleState;
import foam.nanos.test.Test;


// Reject create
public class LiquidApprovalCreateRejectTest extends ApprovalTestExecutor {
  public LiquidApprovalCreateRejectTest() {
    super("create_reject", new ApprovalTestExecutorState[] {
      new ApprovalTestExecutorState(ApprovalStatus.REJECTED, LifecycleState.REJECTED) // create
    });
  }
}
