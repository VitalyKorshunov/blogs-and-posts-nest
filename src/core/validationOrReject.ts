import { validateOrReject } from 'class-validator';

export const validateOrRejectModel = async (
  modelOrDTO: any,
  ctor: { new (): any },
) => {
  if (modelOrDTO instanceof ctor === false) {
    throw new Error('Incorrect input data');
  }
  try {
    await validateOrReject(modelOrDTO);
  } catch (e) {
    throw new Error(e);
  }
};
