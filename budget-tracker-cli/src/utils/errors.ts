export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function isPromptCancellation(error: unknown): boolean {
  return error instanceof Error && ["ExitPromptError", "AbortPromptError", "AbortError"].includes(error.name);
}
