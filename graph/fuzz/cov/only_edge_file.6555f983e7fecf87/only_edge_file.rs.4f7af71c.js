var data = {lines:[
{"lineNum":"    1","line":"#![no_main]"},
{"lineNum":"    2","line":"use libfuzzer_sys::fuzz_target;"},
{"lineNum":"    3","line":"extern crate graph;"},
{"lineNum":"    4","line":""},
{"lineNum":"    5","line":"use std::path::Path;"},
{"lineNum":"    6","line":"use std::fs::File;"},
{"lineNum":"    7","line":"use std::io::prelude::*;"},
{"lineNum":"    8","line":"use std::fs::remove_file;"},
{"lineNum":"    9","line":""},
{"lineNum":"   10","line":"mod utils;"},
{"lineNum":"   11","line":"use utils::*;"},
{"lineNum":"   12","line":""},
{"lineNum":"   13","line":"fuzz_target!(|data: &[u8]| {"},
{"lineNum":"   14","line":"    // writing to file is REALLY slow but"},
{"lineNum":"   15","line":"    // the from_csv function read the file line by line"},
{"lineNum":"   16","line":"    // and we want coverage on this function"},
{"lineNum":"   17","line":"    // so I don\'t think there are any workarounds or mocking"},
{"lineNum":"   18","line":""},
{"lineNum":"   19","line":"    // to speedup the fuzzing it might be sensible to mount the /tmp"},
{"lineNum":"   20","line":"    // to a ramdisk https://wiki.gentoo.org/wiki/Tmpfs","class":"lineCov","hits":"1","order":"1","possible_hits":"1",},
{"lineNum":"   21","line":"    let fname = Path::new(\"/tmp\").join(random_string(64));"},
{"lineNum":"   22","line":"    let filename = fname.to_str().unwrap();"},
{"lineNum":"   23","line":"","class":"lineCov","hits":"2","order":"11","possible_hits":"2",},
{"lineNum":"   24","line":"    // Write the fuzzer output to the file","class":"lineCov","hits":"2","order":"12","possible_hits":"2",},
{"lineNum":"   25","line":"    let mut file = File::create(&filename).unwrap();"},
{"lineNum":"   26","line":"    file.write_all(data).unwrap();","class":"lineCov","hits":"2","order":"13","possible_hits":"2",},
{"lineNum":"   27","line":"","class":"lineCov","hits":"1","order":"14","possible_hits":"1",},
{"lineNum":"   28","line":"    let graph = graph::Graph::from_csv("},
{"lineNum":"   29","line":"        &filename,"},
{"lineNum":"   30","line":"        \"subject\","},
{"lineNum":"   31","line":"        \"object\",","class":"lineCov","hits":"1","order":"15","possible_hits":"1",},
{"lineNum":"   32","line":"        true,","class":"lineCov","hits":"1","order":"16","possible_hits":"1",},
{"lineNum":"   33","line":"        None,","class":"lineCov","hits":"1","order":"17","possible_hits":"1",},
{"lineNum":"   34","line":"        None,","class":"lineCov","hits":"1","order":"18","possible_hits":"1",},
{"lineNum":"   35","line":"        Some(\"weight\"),","class":"lineCov","hits":"1","order":"19","possible_hits":"1",},
{"lineNum":"   36","line":"        Some(1.0),","class":"lineCov","hits":"1","order":"20","possible_hits":"1",},
{"lineNum":"   37","line":"        None,","class":"lineCov","hits":"1","order":"21","possible_hits":"1",},
{"lineNum":"   38","line":"        Some(\"id\"),","class":"lineCov","hits":"1","order":"22","possible_hits":"1",},
{"lineNum":"   39","line":"        Some(\"category\"),","class":"lineCov","hits":"1","order":"23","possible_hits":"1",},
{"lineNum":"   40","line":"        Some(\"biolink:NamedThing\"),","class":"lineCov","hits":"1","order":"24","possible_hits":"1",},
{"lineNum":"   41","line":"        None,"},
{"lineNum":"   42","line":"        None,","class":"lineCov","hits":"1","order":"233","possible_hits":"1",},
{"lineNum":"   43","line":"        None,"},
{"lineNum":"   44","line":"    );","class":"lineCov","hits":"2","order":"234","possible_hits":"2",},
{"lineNum":"   45","line":"","class":"lineCov","hits":"1","order":"235","possible_hits":"1",},
{"lineNum":"   46","line":"    if graph.is_ok(){"},
{"lineNum":"   47","line":"        graph.unwrap().walk(10, 10, Some(0), Some(0.5), Some(2.0), Some(3.0), Some(4.0));","class":"linePartCov","hits":"1","order":"363","possible_hits":"4",},
{"lineNum":"   48","line":"    }"},
{"lineNum":"   49","line":""},
{"lineNum":"   50","line":"    remove_file(&filename);"},
{"lineNum":"   51","line":"});"},
]};
var percent_low = 25;var percent_high = 75;
var header = { "command" : "only_edge_file", "date" : "2020-06-20 18:18:05", "instrumented" : 19, "covered" : 19,};
var merged_data = [];
