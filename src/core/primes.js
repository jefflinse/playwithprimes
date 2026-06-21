// Pure number-theory utilities shared across experiments. No rendering here.

// Boolean sieve of Eratosthenes.
// Returns a Uint8Array of length n+1 where arr[i] === 1 iff i is prime.
export function sieve(n) {
  const isPrimeFlag = new Uint8Array(n + 1);
  if (n >= 2) isPrimeFlag.fill(1, 2); // assume prime, then strike out composites
  for (let i = 2; i * i <= n; i++) {
    if (isPrimeFlag[i]) {
      for (let j = i * i; j <= n; j += i) isPrimeFlag[j] = 0;
    }
  }
  return isPrimeFlag;
}

// All primes <= n, as an array.
export function primesUpTo(n) {
  const flags = sieve(n);
  const primes = [];
  for (let i = 2; i <= n; i++) if (flags[i]) primes.push(i);
  return primes;
}

// Trial-division primality test for a single number.
export function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  if (n % 3 === 0) return n === 3;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

// The k-th prime, 1-indexed: nthPrime(1) === 2.
export function nthPrime(k) {
  if (k < 1) return undefined;
  let count = 0;
  let n = 1;
  while (count < k) {
    n++;
    if (isPrime(n)) count++;
  }
  return n;
}

// π(x): the number of primes <= x.
export function primeCount(x) {
  if (x < 2) return 0;
  const flags = sieve(Math.floor(x));
  let total = 0;
  for (let i = 2; i < flags.length; i++) total += flags[i];
  return total;
}
