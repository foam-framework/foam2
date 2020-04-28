package foam.nanos.approval.test;

import foam.core.X;
import foam.nanos.approval.ApprovalStatus;
import foam.nanos.auth.LifecycleState;
import foam.nanos.test.Test;


public class LiquidApprovalTest extends ApprovalTestExecutor {
  public LiquidApprovalTest() {
    super("all_successful", new ApprovalTestExecutorState[] {
      new ApprovalTestExecutorState(ApprovalStatus.APPROVED, LifecycleState.ACTIVE), // create
      new ApprovalTestExecutorState(ApprovalStatus.APPROVED, LifecycleState.ACTIVE), // update
      new ApprovalTestExecutorState(ApprovalStatus.APPROVED, LifecycleState.DELETED), // remove
    });
  }
}
