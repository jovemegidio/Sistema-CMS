import { Request, Response, NextFunction } from 'express';

type ValidationRule = {
  field: string;
  required?: boolean;
  type?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
};

export function validate(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = req.body[rule.field];

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(rule.message || `${rule.field} is required.`);
        continue;
      }

      if (value !== undefined && value !== null && value !== '') {
        if (rule.type && typeof value !== rule.type) {
          errors.push(`${rule.field} must be of type ${rule.type}.`);
        }

        if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
          errors.push(`${rule.field} must be at least ${rule.minLength} characters.`);
        }

        if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
          errors.push(`${rule.field} must not exceed ${rule.maxLength} characters.`);
        }

        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
          errors.push(rule.message || `${rule.field} format is invalid.`);
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json({ error: errors[0], errors });
      return;
    }

    next();
  };
}
