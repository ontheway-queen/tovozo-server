import Joi from 'joi';

export default class PublicCommonValidator {
  public singleParamNumValidator = (idFieldName: string = 'id') => {
    const schemaObject: any = {};
    schemaObject[idFieldName] = Joi.number().required();
    return Joi.object(schemaObject);
  };

  // single param string validator
  public singleParamStringValidator = (idFieldName: string = 'id') => {
    const schemaObject: any = {};
    schemaObject[idFieldName] = Joi.string().required();
    return Joi.object(schemaObject);
  };

  // multiple params number validator
  public multipleParamsNumValidator(fields: string[]) {
    const schemaObject: any = {};

    fields.forEach((item) => {
      schemaObject[item] = Joi.number().required();
    });

    return Joi.object(schemaObject);
  }

  // multiple params string validator
  public multipleParamsStringValidator(fields: string[]) {
    const schemaObject: any = {};

    fields.forEach((item) => {
      schemaObject[item] = Joi.number().required();
    });

    return Joi.object(schemaObject);
  }
}
