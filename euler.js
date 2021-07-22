function calculateEuler(edges, excluded_chars) {
    //object to store the count for each character in the edges string
    var counts = {};
    //misc variables
    var ch, index, len, count, excluded, result;

    // Loop through each character in the edges string
    if (edges.length == 0) {
        return "Null";
    }
    for (index = 0, len = edges.length; index < len; ++index) {
        ch = edges.charAt(index);
        let excluded = false;
        //check if character is excluded
        excluded_chars.forEach(excluded_char => {
            if (ch == excluded_char) {
                excluded = true;
            }
        });
        //increase count of vertex
        if (!excluded) {
            count = counts[ch];
            counts[ch] = count ? count + 1 : 1;
        }
    }
    
    //count the number of vertices with an odd degree of edges
    var odd = 0;
    for (ch in counts) {
        if (counts[ch] % 2 == 1) { odd++; }
    }
    console.log(odd)
    if (odd <= 2) {
        result = "Euler Path";
    }
    if (odd == 0) {
        result = "Euler Path and Euler Circuit";
    }
    return result;
}

// var edges = "[[b,f],[c,d],[c,e],[f,e],[b,d]]";
// var excluded_chars = ["[", "]", ","];
// console.log(calculateEuler(edges, excluded_chars));

function calculateBtn() {
    let edges = document.getElementById("edges").value;
    // let excluded_chars = document.getElementById("excluded_chars").value;

    // console.log(edges);
    // console.log(excluded_chars);
    // var excluded_chars = ["[", "]", ","];
    // console.log("[[b,f],[c,d],[c,e],[f,e],[b,d]]");


    // // var edges = "[[b,f],[c,d],[c,e],[f,e],[b,d]]";
    // var edges = "[[b,f][f,g][b,f][f,p]]";
    // var excluded_chars = ["[", "]", ","];

    let excluded_chars = ["[", "]", ","];

    result_div = document.getElementById("result_div");
    result_div.innerHTML = calculateEuler(edges, excluded_chars);
}