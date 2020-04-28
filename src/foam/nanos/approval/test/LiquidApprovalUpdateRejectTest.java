package foam.nanos.approval.test;

import foam.core.X;
import foam.nanos.approval.ApprovalStatus;
import foam.nanos.auth.LifecycleState;
import foam.nanos.test.Test;


// Reject update
public class LiquidApprovalUpdateRejectTest extends ApprovalTestExecutor {
  public LiquidApprovalUpdateRejectTest() {
    super("update_reject", new ApprovalTestExecutorState[] {
      new ApprovalTestExecutorState(ApprovalStatus.APPROVED, LifecycleState.ACTIVE), // create
      new ApprovalTestExecutorState(ApprovalStatus.REJECTED, LifecycleState.ACTIVE), // update
      new ApprovalTestExecutorState(ApprovalStatus.APPROVED, LifecycleState.DELETED), // remove
    });
  }
}
