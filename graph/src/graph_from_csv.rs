use super::*;
use crate::csv_utils::{check_consistent_lines, has_columns, get_headers};
use std::{fs::File, io::prelude::*, io::BufReader};
use std::collections::{HashMap, HashSet};
use rayon::prelude::*;

impl Graph {
    fn read_edges_csv(
        path: &str,
        sep: &str,
        sources_column: &str,
        destinations_column: &str,
        edge_types_column: &Option<&str>,
        default_edge_type: &Option<&str>,
        weights_column: &Option<&str>,
        default_weight: &Option<WeightT>,
    )
     -> (
        Vec<NodeT>,
        Vec<NodeT>,
        HashMap<String, NodeT>, 
        Vec<String>,
        Option<Vec<EdgeTypeT>>,
        Option<HashMap<String, EdgeTypeT>>, 
        Option<Vec<String>>,
        Option<Vec<WeightT>>
    )
     {
        // TODO figure out how to use references and lifetimes so that
        // we don't duplicate the strings in the mappings
        let mut sources: Vec<NodeT> = Vec::new();
        let mut destinations: Vec<NodeT> = Vec::new();

        let mut nodes_mapping: HashMap<String, NodeT> = HashMap::new();
        let mut nodes_reverse_mapping: Vec<String> = Vec::new();

        let mut edge_types: Vec<NodeTypeT> = Vec::new();
        let mut edge_types_mapping: HashMap<String, NodeTypeT> = HashMap::new();
        let mut edge_types_reverse_mapping: Vec<String> = Vec::new();

        let mut weights: Vec<WeightT> = Vec::new();

        let mut unique_edges_set: HashSet<(NodeT, NodeT, Option<EdgeTypeT>)> = HashSet::new();
        
        let headers = get_headers(path, sep);

        // open the file
        let file = File::open(path).expect("Cannot open file.");
        let mut buf_reader = BufReader::new(file);
        // Skip header
        let mut line = String::new();
        buf_reader.read_line(&mut line).unwrap();
        // convert the csv to a dict of lists
        for (i, line) in buf_reader.lines().enumerate() {
            for (value, column) in line.as_ref().unwrap().trim_end_matches(|c| c == '\n').split(sep).zip(headers.iter()) {
                
                if column == sources_column || column == destinations_column {
                    if ! nodes_mapping.contains_key(value){
                        nodes_mapping.insert(String::from(value), nodes_reverse_mapping.len());
                        nodes_reverse_mapping.push(String::from(value));
                    }
                    if column == sources_column{
                        sources.push(*nodes_mapping.get(value).unwrap());
                    } else {
                        destinations.push(*nodes_mapping.get(value).unwrap());
                    }
                    continue;
                }
                
                if let Some(etc) = edge_types_column {
                    if column == etc {
                        let _value = if value.is_empty(){
                            default_edge_type.unwrap()
                        } else {
                            value
                        };
                        if ! edge_types_mapping.contains_key(value){
                            edge_types_mapping.insert(String::from(value), edge_types_reverse_mapping.len() as NodeTypeT);
                            edge_types_reverse_mapping.push(String::from(value));
                        }
                        edge_types.push(*edge_types_mapping.get(value).unwrap());
                        continue;
                    }
                }
                
                if let Some(wc) = weights_column {
                    if column == wc {
                        weights.push(
                            if value.is_empty(){
                                default_weight.unwrap().clone()
                            } else {
                                value.parse::<WeightT>().unwrap()
                            }
                        );
                        continue;
                    }
                }
            }
            let triple = (sources[i], destinations[i], if edge_types_column.is_some() {Some(edge_types[i])} else {None});
            if unique_edges_set.contains(&triple){
                panic!(
                    concat!(
                        "\nFound duplicated line in edges file!\n",
                        "Specifically, the duplicated line is the number {i}.\n",
                        "The source node is {source} and destination node is {destination}.\n",
                        "{edge_type_string}",
                        "The path of the document was {path}.\n",
                        "The complete line in question is:\n{line}\n"
                    ),
                    i=i,
                    source=sources[i],
                    destination=destinations[i],
                    edge_type_string=(
                        if edge_types_column.is_some() {
                            format!("The edge type of the row is {}.",edge_types[i])
                        } else {
                            String::from("No edge type was detected.")
                        }
                    ),
                    path=path,
                    line=line.unwrap()
                )
            }
            unique_edges_set.insert(triple);
        };

        (
            sources,
            destinations,
            nodes_mapping,
            nodes_reverse_mapping,
            if edge_types_column.is_some() {Some(edge_types)} else {None},
            if edge_types_column.is_some() {Some(edge_types_mapping)} else {None},
            if edge_types_column.is_some() {Some(edge_types_reverse_mapping)} else {None},
            if weights_column.is_some() {Some(weights)} else {None}
        )
    }

    fn read_nodes_csv(
        path: &str,
        sep: &str,
        nodes_column: &str,
        nodes_mapping: &HashMap<String, NodeT>,
        node_types_column: &str,
        default_node_type: &str
    ) -> (
        Vec<NodeTypeT>,
        HashMap<String, NodeTypeT>,
        Vec<String>
    ){
        let mut nodes: Vec<NodeT> = Vec::new();
        
        let mut node_types: Vec<NodeTypeT> = Vec::new();
        let mut node_types_mapping: HashMap<String, NodeTypeT> = HashMap::new();
        let mut node_types_reverse_mapping: Vec<String> = Vec::new();
        
        let mut unique_nodes_set: HashSet<NodeT> = HashSet::new();

        let headers = get_headers(path, sep);

        // open the file
        let file = File::open(path).expect("Cannot open file.");
        let mut buf_reader = BufReader::new(file);
        // Skip header
        let mut line = String::new();
        buf_reader.read_line(&mut line).unwrap();
        // Flag for when a new non-singleton node has been added
        let mut new_node;
        // convert the csv to a dict of lists
        for (j, line) in buf_reader.lines().enumerate() {
            new_node = false;
            for (value, column) in line.as_ref().unwrap().trim_end_matches(|c| c == '\n').split(sep).zip(headers.iter()) {
                if column == nodes_column {
                    let result = nodes_mapping.get(value);
                    // if the node is not present in the mapping, then it's a
                    // singleton. Therefore it can be ignored and is type doesn't
                    // matter
                    if result.is_none(){
                        continue;
                    }
                    // since the node is not a singleton, add it to the list.
                    nodes.push(*result.unwrap());
                    new_node = true;
                    continue;
                }

                if column == node_types_column{
                    let _value = if value.is_empty(){
                        default_node_type
                    } else {
                        value
                    };
                    if ! node_types_mapping.contains_key(value){
                        node_types_mapping.insert(String::from(value), node_types_reverse_mapping.len() as NodeTypeT);
                        node_types_reverse_mapping.push(String::from(value));
                    }
                    node_types.push(*node_types_mapping.get(value).unwrap());
                }
            }
            if new_node && unique_nodes_set.contains(&nodes[nodes.len()-1]){
                panic!(
                    concat!(
                        "\nFound duplicated line in nodes file!\n",
                        "Specifically, the duplicated line is the number {j}.\n",
                        "The node is {node}.\n",
                        "The node type of the row is {node_type}.\n",
                        "The path of the document was {path}.\n",
                        "The complete line in question is:\n{line}\n"
                    ),
                    j=j,
                    node=nodes[nodes.len()-1],
                    node_type=node_types[nodes.len()-1],
                    path=path,
                    line=line.unwrap()
                )
            }
            unique_nodes_set.insert(nodes[nodes.len()-1]);
        };

        // Sort the node types using the indices order specified by the nodes
        let sorted_node_types: Vec<NodeTypeT> = nodes.par_iter().map(
                |x| node_types[*x]
            ).collect();
        
        // return the results
        (
            sorted_node_types,
            node_types_mapping,
            node_types_reverse_mapping
        )
    }


    pub fn from_csv(
        edge_path: &str,
        sources_column: &str,
        destinations_column: &str,
        directed: bool,
        edge_types_column: Option<&str>,
        default_edge_type: Option<&str>,
        weights_column: Option<&str>,
        default_weight: Option<WeightT>,
        node_path: Option<&str>,
        nodes_column: Option<&str>,
        node_types_column: Option<&str>,
        default_node_type: Option<&str>,
        edge_sep: Option<&str>,
        node_sep: Option<&str>,
        validate_input_data: Option<bool>,
    ) -> Graph {
        // If the separators were not provided we use by default tabs.
        let _edge_sep = edge_sep.unwrap_or_else(|| "\t");
        let _node_sep = node_sep.unwrap_or_else(|| "\t");
        
        // We validate the provided files, starting from the edges file.
        // Specifically, we start by checking if every line has the same amount
        // of the given separator character.
        check_consistent_lines(&*edge_path, &*_edge_sep);
        // Then we check if the given columns actually exist in the given file
        // header.
        has_columns(
            &*edge_path,
            &*_edge_sep,
            &[&sources_column, &destinations_column],
            &[&edge_types_column, &weights_column],
        );
        
        // If the nodes path was provided, we also validate it.
        if let Some(path) = &node_path {
            // As for the previous file, first we check that the file has the
            // same amount of separators in each line.
            check_consistent_lines(&*path, &*_node_sep);
            if nodes_column.is_none(){
                panic!("If the node_path is passed, the nodes_column is required");
            }
            if node_types_column.is_none(){
                panic!("If the node_path is passed, the node_types_column is required");
            }
            // Then we check if the given columns actually exists in the file.
            has_columns(
                &*path,
                &*_node_sep,
                &[&nodes_column.clone().unwrap()],
                &[&node_types_column],
            );
        }

        let (
            sources,
            destinations,
            nodes_mapping,
            nodes_reverse_mapping,
            edge_types,
            edge_types_mapping,
            edge_types_reverse_mapping,
            weights
        ) = Graph::read_edges_csv(
            &edge_path,
            &_edge_sep,
            &sources_column,
            &destinations_column,
            &edge_types_column,
            &default_edge_type,
            &weights_column,
            &default_weight
        );
        

        let (
            node_types,
            node_types_mapping,
            node_types_reverse_mapping
        ) = if let Some(path) = &node_path {
            if nodes_column.is_none() {
                panic!("Argument path with value '{}' for node files was given but nodes_column parameter was left empty!", path);
            }
            if node_types_column.is_none() {
                panic!("Argument path with value '{}' for node files was given but node_types_column parameter was left empty!", path);
            }
            if default_node_type.is_none() {
                panic!("Argument path with value '{}' for node files was given but default_node_type parameter was left empty!", path);
            }
            let (
                node_types,
                node_types_mapping,
                node_types_reverse_mapping
            ) = Graph::read_nodes_csv(
                &path,
                &_node_sep,
                &nodes_column.unwrap(),
                &nodes_mapping,
                &node_types_column.unwrap(),
                &default_node_type.unwrap(),
            );
            (Some(node_types), Some(node_types_mapping), Some(node_types_reverse_mapping))
        } else {
            (None, None, None)
        };

        if directed {
            Graph::new_directed(
                sources,
                destinations,
                nodes_mapping,
                nodes_reverse_mapping,
                node_types,
                node_types_mapping,
                node_types_reverse_mapping,
                edge_types,
                edge_types_mapping,
                edge_types_reverse_mapping,
                weights,
                validate_input_data,
            )
        } else {
            Graph::new_undirected(
                sources,
                destinations,
                nodes_mapping,
                nodes_reverse_mapping,
                node_types,
                node_types_mapping,
                node_types_reverse_mapping,
                edge_types,
                edge_types_mapping,
                edge_types_reverse_mapping,
                weights,
                validate_input_data,
            )
        }
    }
}