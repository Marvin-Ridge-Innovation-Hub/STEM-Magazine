export type AssistantWarningSource = 'grammar' | 'copyright';

export type AssistantWarningSeverity = 'low' | 'medium' | 'high';

export interface AssistantWarning {
  id: string;
  source: AssistantWarningSource;
  severity: AssistantWarningSeverity;
  message: string;
  evidence?: string;
  suggestedIssueCodes: string[];
  blocking: boolean;
}
