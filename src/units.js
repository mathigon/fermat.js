// =============================================================================
// Fermat.js | Units
// (c) 2017 Mathigon
// =============================================================================



// -----------------------------------------------------------------------------
// Configuration

const prefixes = {
  da: { name: 'deca',  value: 1e1 },
  h:  { name: 'hecto', value: 1e2 },
  k:  { name: 'kilo',  value: 1e3 },
  M:  { name: 'mega',  value: 1e6 },
  G:  { name: 'giga',  value: 1e9 },
  T:  { name: 'tera',  value: 1e12 },
  P:  { name: 'peta',  value: 1e15 },
  E:  { name: 'exa',   value: 1e18 },
  Z:  { name: 'zetta', value: 1e21 },
  Y:  { name: 'yotta', value: 1e24 },

  d:  { name: 'deci',  value: 1e-1 },
  c:  { name: 'centi', value: 1e-2 },
  m:  { name: 'milli', value: 1e-3 },
  u:  { name: 'micro', value: 1e-6 },
  n:  { name: 'nano',  value: 1e-9 },
  p:  { name: 'pico',  value: 1e-12 },
  f:  { name: 'femto', value: 1e-15 },
  a:  { name: 'atto',  value: 1e-18 },
  z:  { name: 'zepto', value: 1e-21 },
  y:  { name: 'yocto', value: 1e-24 }
};

const baseUnits = {
  length: 'm',
  surface: 'm2',
  volume: 'm3',
  mass: 'kg',
  time: 's',
  angle: 'rad',
  current: 'a',
  temperature: 'K',
  substance: 'mol',
  force: 'N',
  bit: 'b'
};

const units = {

  // Length
  m:  { name: 'meter',    type: 'length', value: 1 },
  in: { name: 'inch',     type: 'length', value: 0.0254 },
  ft: { name: 'foot',     type: 'length', value: 0.3048 },
  yd: { name: 'yard',     type: 'length', value: 0.9144 },
  mi: { name: 'mile',     type: 'length', value: 1609.344 },
  AA: { name: 'angstrom', type: 'length', value: 1e-10 },

  // Surface
  m2:    { name: 'm2',    type: 'surface', power: 2, value: 1 },
  sqin:  { name: 'sqin',  type: 'surface', power: 2, value: 0.00064516 },
  sqft:  { name: 'sqft',  type: 'surface', power: 2, value: 0.09290304 },
  sqyd:  { name: 'sqyd',  type: 'surface', power: 2, value: 0.83612736 },
  sqmi:  { name: 'sqmi',  type: 'surface', power: 2, value: 2589988.110336 },

  // Volume
  m3:     { name: 'm3',     type: 'volume', value: 1 },
  l:      { name: 'litre',  type: 'volume', value: 0.001 },
  cup:    { name: 'cup',    type: 'volume', value: 0.0002365882 },
  pint:   { name: 'pint',   type: 'volume', value: 0.0004731765 },
  quart:  { name: 'quart',  type: 'volume', value: 0.0009463529 },
  gallon: { name: 'gallon', type: 'volume', value: 0.003785412},
  barrel: { name: 'barrel', type: 'volume', value: 0.1589873 },

  // Mass
  g:   { name: 'gram',  type: 'mass', value: 0.001 },
  ton: { name: 'ton',   type: 'mass', value: 907.18474 },
  oz:  { name: 'ounce', type: 'mass', value: 28.349523125e-3 },
  lbm: { name: 'pound', type: 'mass', value: 453.59237e-3 },

  // Time
  s:   { name: 'second', type: 'time', value: 1 },
  min: { name: 'minute', type: 'time', value: 60 },
  h:   { name: 'hour',   type: 'time', value: 3600 },
  d:   { name: 'day',    type: 'time', value: 86400 },
  w:   { name: 'week',   type: 'time', value: 604800 },
  mon: { name: 'month',  type: 'time', value: 2629740 },
  y:   { name: 'year',   type: 'time', value: 31556900 },

  // Angle
  rad:  { name: 'rad',   type: 'angle', value: 1 },
  deg:  { name: 'deg',   type: 'angle', value: 0.017453292519943295769236907684888 },
  grad: { name: 'grad',  type: 'angle', value: 0.015707963267948966192313216916399 },
  cyc:  { name: 'cycle', type: 'angle', value: 6.2831853071795864769252867665793 },

  // Electric Current
  A: {name: 'ampere', type: 'current', value: 1 },

  // Temperature
  K:    { name: 'kelvin',     type: 'temperature', value: 1 },
  degC: { name: 'celsius',    type: 'temperature', value: 1, offset: 273.15 },
  degF: { name: 'fahrenheit', type: 'temperature', value: 1/1.8, offset: 459.67 },

  // Amount of Substance
  mol: { name: 'mole', type: 'substance', value: 1 },

  // Force
  N:   { name: 'newton',     type: 'force', value: 1 },
  lbf: { name: 'poundforce', type: 'force', value: 4.4482216152605 },

  // Binary
  b: {name: 'bits',  type: 'data', value: 1 },
  B: {name: 'bytes', type: 'data', value: 8 }
};


// ---------------------------------------------------------------------------------------------
// Create Regex

const prefixRegexp = prefixes.keys().join('|');
const unitRegexp = units.keys().join('|');
const regexp = new RegExp('^(' + prefixRegexp + ')?(' + unitRegexp + ')$');


// ---------------------------------------------------------------------------------------------
// Exports

export function convert(val, fromUnit, toUnit = null) {
  let f = fromUnit.match(regexp);
  let prefix = f[1];
  let unit = f[2];

  let prefixValue = prefix ? (prefixes[prefix].value || 0) : 1;
  let unitValue = units[unit].value || 1;
  let unitOffset = units[unit].offset || 0;

  let newVal = (val * unitValue + unitOffset) * prefixValue;
  if (toUnit == null) return newVal;

  f = toUnit.match(regexp);
  prefix = f[1];
  unit = f[2];

  prefixValue = prefix ? (prefixes[prefix].value || 0) : 1;
  unitValue = units[unit].value || 1;
  unitOffset = units[unit].offset || 0;

  return (newVal / prefixValue - unitOffset) / unitValue;
}

export function define(unit) {
  unit = unit.match(regexp);
  let prefix = unit[1] ? prefixes[unit[1]].name : '';
  let name = units[unit[2]].name;
  return prefix + name;
}
