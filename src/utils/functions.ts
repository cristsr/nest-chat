export function getMethodName() {
  const stack = new Error().stack;

  const fullName = stack.split('at ')[2].split(' ')[0];

  const shortName = fullName.split('.')[1];

  if (shortName) {
    return shortName;
  }

  return fullName;
}
