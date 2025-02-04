import { validateSync } from 'class-validator';

export const configValidationUtility = {
  validateConfig: (configInstance: any) => {
    const errors = validateSync(configInstance);
    if (errors.length > 0) {
      const sortedMessages = errors
        .map((error) => {
          const currentValue = error.value;
          const constraints = Object.values(error.constraints || {}).join(', ');
          return `${constraints} (currentValue: ${currentValue})`;
        })
        .join('; ');
      throw new Error('Validation failed: ' + sortedMessages);
    }
  },
  convertToBoolean(value: string) {
    const trimmedValue = value?.trim();

    switch (trimmedValue) {
      case 'true':
        return true;
      case '1':
        return true;

      case 'false':
        return false;
      case '0':
        return false;
    }

    return null;
  },
  getEnumValue<T extends Record<string, string>>(enumObj: T): string[] {
    return Object.values(enumObj);
  },
};
