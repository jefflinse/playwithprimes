// The single place experiments are registered. To add one: write the file,
// import it here, and add it to the array.
import ulamSpiral from '../experiments/ulam-spiral.js';
import sacksSpiral from '../experiments/sacks-spiral.js';
import diagonalBounce from '../experiments/diagonal-bounce.js';
import primePolar from '../experiments/prime-polar.js';
import modularWheel from '../experiments/modular-wheel.js';
import gaussianPrimes from '../experiments/gaussian-primes.js';
import primeCounting from '../experiments/prime-counting.js';
import goldbachComet from '../experiments/goldbach-comet.js';

export const experiments = [
  ulamSpiral,
  sacksSpiral,
  diagonalBounce,
  primePolar,
  modularWheel,
  gaussianPrimes,
  primeCounting,
  goldbachComet,
];
