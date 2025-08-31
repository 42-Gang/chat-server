import { getLogger } from '../../../plugins/logger.js';

export function socketErrorHandler<Args extends unknown[], Return>(
  handler: (...args: Args) => Return | Promise<Return>,
): (...args: Args) => void {
  const handleError = (err: unknown) => {
    getLogger().error({ err }, 'socket handler error');
  };

  return (...args: Args): void => {
    try {
      const result = handler(...args);

      if (
        result instanceof Promise ||
        (typeof result === 'object' &&
          result !== null &&
          'then' in result &&
          typeof (result as unknown as Promise<Return>).then === 'function')
      ) {
        (result as Promise<Return>).catch(handleError);
      }
    } catch (e) {
      handleError(e);
    }
  };
}
