import type { Request, Response, NextFunction } from 'express';

export const validateBody = (schema: any) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const { error, value } = schema.validate(req.body);
		if (error) {
			res.status(400).json({error: error.details[0].message});
		}

		next();
	};
};

export const validateQuery = (schema: any) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const { error, value } = schema.validate(req.query);
		if (error) {
			res.status(400).json({error: error.details[0].message});
		}

		next();
	};
};