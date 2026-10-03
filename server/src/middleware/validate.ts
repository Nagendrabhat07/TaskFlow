import { validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      next();
      return;
    }

    const extractedErrors = errors.array().map((err) => ({
      field: err.type === 'field' ? err.path : 'general',
      message: err.msg,
    }));

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors,
    });
  };
};
