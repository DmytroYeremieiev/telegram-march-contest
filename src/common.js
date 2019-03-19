export function pipe(...fns) {
  return x => fns.reduce((v, f) => f(v), x);
}


