// The single place experiments are registered. To add one: write the file,
// import it here, and add it to the array.
import ulamSpiral from '../experiments/ulam-spiral.js';
import primePolar from '../experiments/prime-polar.js';
import primeCounting from '../experiments/prime-counting.js';
import diagonalBounce from '../experiments/diagonal-bounce.js';

export const experiments = [ulamSpiral, primePolar, primeCounting, diagonalBounce];
