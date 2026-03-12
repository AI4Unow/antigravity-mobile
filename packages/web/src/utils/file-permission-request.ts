import type { FilePermissionRequest, TrajectoryStep } from "../types";

/**
 * Extract a filePermissionRequest from any of the tool data fields
 * where the LS may embed it, or from the step's top-level field.
 */
export function getFilePermissionRequest(
  step: TrajectoryStep,
): FilePermissionRequest | undefined {
  return (
    step.filePermissionRequest ??
    step.viewFile?.filePermissionRequest ??
    step.listDirectory?.filePermissionRequest ??
    step.codeAction?.filePermissionRequest ??
    step.grepSearch?.filePermissionRequest ??
    step.viewFileOutline?.filePermissionRequest ??
    step.viewCodeItem?.filePermissionRequest
  );
}
