var data = {lines:[
{"lineNum":"    1","line":"use super::types::*;"},
{"lineNum":"    2","line":"use ::core::cmp::Ordering;"},
{"lineNum":"    3","line":"use std::cmp::min;"},
{"lineNum":"    4","line":""},
{"lineNum":"    5","line":"// global static seed, this could be moved inside a struct"},
{"lineNum":"    6","line":"// WARNING"},
{"lineNum":"    7","line":"// the current implementation is not thread safe because we"},
{"lineNum":"    8","line":"// mutate a shared state between threads without any locks."},
{"lineNum":"    9","line":"// This should not create any problem since we do not need"},
{"lineNum":"   10","line":"// a strong PRNG so for speed sake it\'s intentionally let"},
{"lineNum":"   11","line":"// this way."},
{"lineNum":"   12","line":"// The only real problem could be that we lose determinism"},
{"lineNum":"   13","line":"static mut GLOBAL_SEED: [u64; 4] = ["},
{"lineNum":"   14","line":"    6591408588322595484,"},
{"lineNum":"   15","line":"    5451729388608518856,"},
{"lineNum":"   16","line":"    8913376598984957243,"},
{"lineNum":"   17","line":"    17912695770704705270,"},
{"lineNum":"   18","line":"];"},
{"lineNum":"   19","line":""},
{"lineNum":"   20","line":"#[inline(always)]"},
{"lineNum":"   21","line":"fn rotl(x: u64, k: u64) -> u64 {","class":"lineNoCov","hits":"0","possible_hits":"1",},
{"lineNum":"   22","line":"    (x << k) | (x >> (64 - k))","class":"lineNoCov","hits":"0","possible_hits":"1",},
{"lineNum":"   23","line":"}"},
{"lineNum":"   24","line":""},
{"lineNum":"   25","line":"#[inline(always)]"},
{"lineNum":"   26","line":"pub fn xorshiro256plus() -> f64 {"},
{"lineNum":"   27","line":"    // based on xorshiro256+ which seems to be the fastest floating point generator"},
{"lineNum":"   28","line":"    // http://prng.di.unimi.it/xoshiro256plus.c"},
{"lineNum":"   29","line":"    // the conversion from u64 to f64 is taken from:"},
{"lineNum":"   30","line":"    // http://prng.di.unimi.it/"},
{"lineNum":"   31","line":"    // the informations about the structure of a f64 was taken from IEEE 754"},
{"lineNum":"   32","line":"    // https://standards.ieee.org/content/ieee-standards/en/standard/754-2019.html"},
{"lineNum":"   33","line":"    // https://en.wikipedia.org/wiki/Double-precision_floating-point_format"},
{"lineNum":"   34","line":"    // if this is still a bottleneck we can consider to implement"},
{"lineNum":"   35","line":"    // http://prng.di.unimi.it/xoshiro256+-vect-speed.c"},
{"lineNum":"   36","line":"    // which exploits avx to generate in parallel 8 random numbers and fill a"},
{"lineNum":"   37","line":"    // cache with it"},
{"lineNum":"   38","line":"    unsafe {"},
{"lineNum":"   39","line":"        // normal xorshiro implementation"},
{"lineNum":"   40","line":"        let (result, _): (u64, bool) = GLOBAL_SEED[0].overflowing_add(GLOBAL_SEED[3]);","class":"lineNoCov","hits":"0","possible_hits":"1",},
{"lineNum":"   41","line":""},
{"lineNum":"   42","line":"        let t: u64 = GLOBAL_SEED[1] << 17;","class":"lineNoCov","hits":"0","possible_hits":"1",},
{"lineNum":"   43","line":""},
{"lineNum":"   44","line":"        GLOBAL_SEED[2] ^= GLOBAL_SEED[0];","class":"lineNoCov","hits":"0","possible_hits":"1",},
{"lineNum":"   45","line":"        GLOBAL_SEED[3] ^= GLOBAL_SEED[1];","class":"lineNoCov","hits":"0","possible_hits":"1",},
{"lineNum":"   46","line":"        GLOBAL_SEED[1] ^= GLOBAL_SEED[2];","class":"lineNoCov","hits":"0","possible_hits":"1",},
{"lineNum":"   47","line":"        GLOBAL_SEED[0] ^= GLOBAL_SEED[3];","class":"lineNoCov","hits":"0","possible_hits":"1",},
{"lineNum":"   48","line":""},
{"lineNum":"   49","line":"        GLOBAL_SEED[2] ^= t;","class":"lineNoCov","hits":"0","possible_hits":"1",},
{"lineNum":"   50","line":""},
{"lineNum":"   51","line":"        GLOBAL_SEED[3] = rotl(GLOBAL_SEED[3], 45);","class":"lineNoCov","hits":"0","possible_hits":"2",},
{"lineNum":"   52","line":"        // method proposed by vigna on http://prng.di.unimi.it/"},
{"lineNum":"   53","line":"        let v: u64 = (result >> 11) | (1023 << 52);","class":"lineNoCov","hits":"0","possible_hits":"1",},
{"lineNum":"   54","line":"        let r: f64 = f64::from_le_bytes(v.to_le_bytes());","class":"lineNoCov","hits":"0","possible_hits":"1",},
{"lineNum":"   55","line":"        r - 1f64","class":"lineNoCov","hits":"0","possible_hits":"1",},
{"lineNum":"   56","line":"    }"},
{"lineNum":"   57","line":"}","class":"lineNoCov","hits":"0","possible_hits":"1",},
{"lineNum":"   58","line":""},
{"lineNum":"   59","line":"pub fn sample(weights: &[WeightT]) -> usize {","class":"lineNoCov","hits":"0","possible_hits":"3",},
{"lineNum":"   60","line":"    if weights.len() == 1{","class":"lineNoCov","hits":"0","possible_hits":"2",},
{"lineNum":"   61","line":"        return 0;","class":"lineNoCov","hits":"0","possible_hits":"1",},
{"lineNum":"   62","line":"    }"},
{"lineNum":"   63","line":""},
{"lineNum":"   64","line":"    let mut cumulative_sum: Vec<f64> = Vec::with_capacity(weights.len());","class":"lineNoCov","hits":"0","possible_hits":"2",},
{"lineNum":"   65","line":"    let mut total_weight = 0f64;","class":"lineNoCov","hits":"0","possible_hits":"1",},
{"lineNum":"   66","line":"    for w in weights {","class":"lineNoCov","hits":"0","possible_hits":"4",},
{"lineNum":"   67","line":"        total_weight += w;","class":"lineNoCov","hits":"0","possible_hits":"1",},
{"lineNum":"   68","line":"        cumulative_sum.push(total_weight);","class":"lineNoCov","hits":"0","possible_hits":"1",},
{"lineNum":"   69","line":"    }","class":"lineNoCov","hits":"0","possible_hits":"1",},
{"lineNum":"   70","line":""},
{"lineNum":"   71","line":"    let frnd = xorshiro256plus();","class":"lineNoCov","hits":"0","possible_hits":"1",},
{"lineNum":"   72","line":"    let rnd: f64 = frnd * cumulative_sum[cumulative_sum.len() - 1];","class":"lineNoCov","hits":"0","possible_hits":"2",},
{"lineNum":"   73","line":""},
{"lineNum":"   74","line":"    // Find the first item which has a weight *higher* than the chosen weight."},
{"lineNum":"   75","line":"    let result = match cumulative_sum","class":"lineNoCov","hits":"0","possible_hits":"4",},
{"lineNum":"   76","line":"        .binary_search_by(|w| {","class":"lineNoCov","hits":"0","possible_hits":"3",},
{"lineNum":"   77","line":"            if *w <= rnd {","class":"lineNoCov","hits":"0","possible_hits":"2",},
{"lineNum":"   78","line":"                Ordering::Less","class":"lineNoCov","hits":"0","possible_hits":"1",},
{"lineNum":"   79","line":"            } else {"},
{"lineNum":"   80","line":"                Ordering::Greater","class":"lineNoCov","hits":"0","possible_hits":"1",},
{"lineNum":"   81","line":"            }"},
{"lineNum":"   82","line":"        })","class":"lineNoCov","hits":"0","possible_hits":"3",},
{"lineNum":"   83","line":"    {"},
{"lineNum":"   84","line":"        Ok(g) => g,","class":"lineNoCov","hits":"0","possible_hits":"2",},
{"lineNum":"   85","line":"        Err(g) => {","class":"lineNoCov","hits":"0","possible_hits":"1",},
{"lineNum":"   86","line":"            g //min(g, weights.len() - 1)","class":"lineNoCov","hits":"0","possible_hits":"4",},
{"lineNum":"   87","line":"        }"},
{"lineNum":"   88","line":"    };"},
{"lineNum":"   89","line":"","class":"lineNoCov","hits":"0","possible_hits":"3",},
{"lineNum":"   90","line":"    if result >= weights.len() {"},
{"lineNum":"   91","line":"        panic!("},
{"lineNum":"   92","line":"            \"Sampling Error: weights: {:?} cumsum: {:?} frnd: {} rnd: {} result: {}\","},
{"lineNum":"   93","line":"            weights, cumulative_sum, frnd, rnd, result"},
{"lineNum":"   94","line":"        )"},
{"lineNum":"   95","line":"    }"},
{"lineNum":"   96","line":""},
{"lineNum":"   97","line":"    result"},
{"lineNum":"   98","line":"}"},
]};
var percent_low = 25;var percent_high = 75;
var header = { "command" : "with_nodes", "date" : "2020-06-21 18:12:12", "instrumented" : 35, "covered" : 0,};
var merged_data = [];