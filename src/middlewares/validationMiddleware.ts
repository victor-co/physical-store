import { Request, Response, NextFunction } from 'express';

export const validateCreateStore = (req: Request, res: Response, next: NextFunction): void => {
  const { name, cep } = req.body;

  if (!name || !cep) {
    res.status(400).json({ message: 'Nome e CEP são obrigatórios' });
    return;
  }

  next();
};

export const validateGetNearbyStores = (req: Request, res: Response, next: NextFunction): void => {
  const { cep } = req.query;

  if (!cep) {
    res.status(400).json({ message: 'CEP é obrigatório' });
    return;
  }

  next();
};