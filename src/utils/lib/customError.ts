import {
  ERROR_LEVEL_CRITICAL,
  ERROR_LEVEL_DEBUG,
  ERROR_LEVEL_ERROR,
  ERROR_LEVEL_INFO,
  ERROR_LEVEL_WARNING,
} from '../miscellaneous/constants';

interface IError {
  message: string;
  status: number;
}

export default class CustomError extends Error implements IError {
  message: string;
  status: number;
  level?:
    | typeof ERROR_LEVEL_DEBUG
    | typeof ERROR_LEVEL_INFO
    | typeof ERROR_LEVEL_WARNING
    | typeof ERROR_LEVEL_ERROR
    | typeof ERROR_LEVEL_CRITICAL;
  metadata?: {};
  constructor(
    message: string,
    status: number,
    level?:
      | typeof ERROR_LEVEL_DEBUG
      | typeof ERROR_LEVEL_INFO
      | typeof ERROR_LEVEL_WARNING
      | typeof ERROR_LEVEL_ERROR
      | typeof ERROR_LEVEL_CRITICAL,
    metadata?: {}
  ) {
    super(message);
    this.status = status;
    this.message = message;
    this.level = level;
    this.metadata = metadata;
    console.log({metadata});
  }
}
