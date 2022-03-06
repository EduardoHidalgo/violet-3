import { BaseError, HttpCode, ServerErrorCode } from "@/core/error";

class InvalidSuccessResultException extends BaseError {
  constructor() {
    super({
      code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
      message: "A Result object cannot be successful and contain an error.",
      type: `${InvalidSuccessResultException.name}`,
    });
  }
}

class InvalidFailureResultException extends BaseError {
  constructor() {
    super({
      code: ServerErrorCode["INTERNAL-SERVER-ERROR"],
      message: "A failing Result instance needs to contain an error message.",
      type: `${InvalidFailureResultException.name}`,
    });
  }
}

class Success<S, F> {
  readonly value: S;

  constructor(value: S) {
    this.value = value;
  }

  isSuccess = (): this is Success<S, F> => true;

  isFailure = (): this is Failure<S, F> => false;
}

class Failure<S, F> {
  readonly value: F;

  constructor(value: F) {
    this.value = value;
  }

  isSuccess = (): this is Success<S, F> => false;

  isFailure = (): this is Failure<S, F> => true;
}

interface ResultArgs<T> {
  /** HTTP status code that would be included in the express response. */
  code: HttpCode;

  /** If true, result will be considered as successful. */
  isSuccess: boolean;

  /** Property for setting negative result. */
  error?: BaseError;

  /** Property for setting positive result. */
  value?: T;
}

/** Utility to provide a common result between positive and negative return
 * types (like a async entity object or a {@link BaseError}). Use this always
 * when you want to solve multiple return types on async or even sync methods.
 *
 * @template T any type that could be returned instead of an Error. All errors
 * are instances of {@link BaseError}.
 */
export class Result<T> implements ResultArgs<T> {
  public code: HttpCode;
  public isFailure: boolean;
  public isSuccess: boolean;
  public error?: BaseError;
  public value?: T;

  public constructor(args: ResultArgs<T>) {
    const { code, error, isSuccess, value } = args;

    if (isSuccess && error) throw new InvalidSuccessResultException();

    if (!isSuccess && !error) throw new InvalidFailureResultException();

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.code = code;
    this.error = error;
    this.value = value;

    Object.freeze(this);
  }

  public getValue() {
    if (!this.isSuccess) {
      return this.error;
    }

    return this.value;
  }

  public toString() {
    return JSON.stringify({
      code: this.code,
      error: this.error,
      value: this.value,
    });
  }

  /** Static factory method for build a Failure Result.
   *
   * @param args {@link S} value required as Success Result.
   * @returns Return a new instance of Result with the generic type {@link S}
   * provided.
   */
  public static ok = <S, F>(args: {
    code: HttpCode;
    value?: S;
  }): Either<S, F> => {
    const { code, value } = args;

    const result = new Result<S>({
      code,
      error: undefined,
      isSuccess: true,
      value,
    });

    return new Success(result);
  };

  /** Static factory method for build a Failure Result.
   *
   * @param args Error object is required to setting Failure Result.
   * @returns Return a new instance of Result with the generic type {@link F}
   * provided.
   */
  public static fail = <S, F>(args: { error: any }): Either<S, F> => {
    const { error } = args;
    let code = ServerErrorCode["INTERNAL-SERVER-ERROR"];

    // If error object has a code property, take it, otherwise use default.
    if (error instanceof Object) {
      for (var key in error) {
        if (key === "code") code = error.code;
      }
    }

    const result = new Result<F>({
      code,
      error,
      isSuccess: false,
      value: undefined,
    });

    return new Failure(result);
  };
}

/** Interface to define two common results as the same potencial returnable
 * type, to gain better inference and handling of.
 *
 * @template S Left result, asuming always be the positive result of both
 * possible returnable types (expresed by {@link Success} class type).
 * @template F Right result, asuming always be the negative result of both
 * possible returnable types (expresed by {@link Failure} class type).
 */
export type Either<S, F> =
  | Success<Result<S>, Result<F>>
  | Failure<Result<S>, Result<F>>;

/** Promise equivalent of {@link Either} type. */
export type EitherPromise<S, F> = Promise<Either<S, F>>;

export type Empty = null;
