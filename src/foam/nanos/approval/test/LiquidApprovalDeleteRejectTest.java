package foam.nanos.approval.test;

import foam.core.X;
import foam.nanos.approval.ApprovalStatus;
import foam.nanos.auth.LifecycleState;
import foam.nanos.test.Test;

// Reject delete
public class LiquidApprovalDeleteRejectTest extends ApprovalTestExecutor {
  public LiquidApprovalDeleteRejectTest() {
    super("delete_reject", new ApprovalTestExecutorState[] {
      new ApprovalTestExecutorState(ApprovalStatus.APPROVED, LifecycleState.ACTIVE), // create
      new ApprovalTestExecutorState(ApprovalStatus.APPROVED, LifecycleState.ACTIVE), // update
      new ApprovalTestExecutorState(ApprovalStatus.REJECTED, LifecycleState.ACTIVE), // remove
    });
  }
}
