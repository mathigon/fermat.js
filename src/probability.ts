// Probability Library

import { factorial } from "./combinatorics";

// Factorial function

  // Combinations function
  export function combinations(n: number, r: number): number {
    if (n < 0 || r < 0 || n < r || !Number.isInteger(n) || !Number.isInteger(r)) {
      throw new Error('Invalid input for combinations.');
    }
    return factorial(n) / (factorial(r) * factorial(n - r));
  }
  
  // Probability Mass Function (PMF) for a discrete random variable
  export function pmf(x: number, p: number): number {
    // Assuming x is a non-negative integer
    if (x < 0 || !Number.isInteger(x)) {
      throw new Error('PMF is only defined for non-negative integers.');
    }
    return Math.pow(1 - p, x - 1) * p;
  }
  
  // Cumulative Distribution Function (CDF) for a discrete random variable
  export function cdf(x: number, p: number): number {
    // Assuming x is a non-negative integer
    if (x < 0 || !Number.isInteger(x)) {
      throw new Error('CDF is only defined for non-negative integers.');
    }
    return 1 - Math.pow(1 - p, x);
  }
  
  // Binomial Distribution Probability
  export function binomialProbability(x: number, n: number, p: number): number {
    // Assuming x is a non-negative integer
    if (x < 0 || !Number.isInteger(x)) {
      throw new Error('Binomial distribution is only defined for non-negative integers.');
    }
    return combinations(n, x) * Math.pow(p, x) * Math.pow(1 - p, n - x);
  }
  
  // Geometric Distribution Probability
  export function geometricProbability(x: number, p: number): number {
    // Assuming x is a non-negative integer
    if (x < 0 || !Number.isInteger(x)) {
      throw new Error('Geometric distribution is only defined for non-negative integers.');
    }
    return Math.pow(1 - p, x - 1) * p;
  }
  
  // Poisson Distribution Probability
  export function poissonProbability(x: number, λ: number): number {
    // Assuming x is a non-negative integer
    if (x < 0 || !Number.isInteger(x)) {
      throw new Error('Poisson distribution is only defined for non-negative integers.');
    }
    return Math.exp(-λ) * Math.pow(λ, x) / factorial(x);
  }
  
  // Normal Distribution Probability
  export function normalProbability(x: number, mean: number, stdDev: number): number {
    return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
  }
  
  // Exponential Distribution Probability
  export function exponentialProbability(x: number, λ: number): number {
    return λ * Math.exp(-λ * x);
  }
  
  // Uniform Distribution Probability
  export function uniformProbability(x: number, a: number, b: number): number {
    if (x >= a && x <= b) {
      return 1 / (b - a);
    }
    return 0;
  }
  
  // Joint Probability of two independent events
  export function jointProbability(eventA: number, eventB: number): number {
    return eventA * eventB;
  }
  
  // Conditional Probability of event A given that event B has occurred
  export function conditionalProbability(eventA: number, eventB: number): number {
    if (eventB === 0) {
      throw new Error('Cannot calculate conditional probability when eventB has zero probability.');
    }
    return eventA / eventB;
  }
  
