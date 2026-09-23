export type ValidationError = {
  code: string;
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

export function validationResult(errors: ValidationError[]): ValidationResult {
  return {
    valid: errors.length === 0,
    errors,
  };
}
