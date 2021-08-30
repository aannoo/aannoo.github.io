function initCy(directed) {
    if (directed) {
        var arrowShape = 'triangle'
    } else {
        var arrowshape = 'none'
    }
    var cy = cytoscape({
        container: document.getElementById('cy'), // container to render in
        elements: [ // list of graph elements to start with
        ],
        style: [ // the stylesheet for the graph
        {
            selector: 'node',
            style: {
            'background-color': '#666',
            'label': 'data(id)'
            }
        },
        {
            selector: 'edge',
            style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': arrowShape,
            'curve-style': 'bezier'
            }
        }
        ],
        layout: {
            name: 'circle',
            rows: 1,
            animate: true,
            // userZoomingEnabled =false,

        }
    });
    return cy;
}



function calculateEuler(edges, excluded_chars) {
    //object to store the count for each character in the edges string
    var counts = {};
    //variables
    var ch, index, len, count, result;
    var vertexCount = 0;

    // loop through each character in the edges string
    if (edges.length == 0) {
        return "Null";
    }
    for (index = 0, len = edges.length; index < len; ++index) {
        ch = edges.charAt(index);
        let excluded = false;
        // check if character is excluded
        excluded_chars.forEach(excluded_char => {
            if (ch == excluded_char) {
                excluded = true;
            }
        });
        // increase count of vertex
        if (!excluded) {
            count = counts[ch];
            counts[ch] = count ? count + 1 : 1;
            vertexCount++;
        }
    }
    
    // count the number of vertices with an odd degree of edges
    var odd = 0;
    var uniqueVertexCount = 0;
    for (ch in counts) {
        if (counts[ch] % 2 == 1) { odd++; }
        uniqueVertexCount++;
    }
    if (uniqueVertexCount == 0) {
        return "Invalid - no verticies";
    }
    console.log(vertexCount)
    if (uniqueVertexCount == 1 && vertexCount == 2) {
        return "Euler Path and Euler Circuit - Self Loop"
    }
    if (vertexCount == 1) {
        return "Invalid - Edge not defined"
    }
    if (odd <= 2) {
        result = "Euler Path";
    }
    if (odd == 0) {
        result = "Euler Path and Euler Circuit";
    }
    if (result == null) {
        result = "No Euler Path in this Graph";
    }
    return result;
}


function calculateBtn() {
    let checked = document.getElementById('directed-checkbox').checked;
    console.log(checked);

    if (checked) {
        var cy = initCy(true);
        var isDirected = true;
    } else {
        var cy = initCy(false);
        var isDirected = false;
    }

    var collection = cy.elements('node');
    cy.remove( collection );

    document.getElementById('cy').style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
    document.getElementById('cy').style.height = '300px';

    let inputTextBox = document.getElementById("edges");
    inputTextBox.style.border = 'none';
    let edges = inputTextBox.value;
    // let excluded_chars = document.getElementById("excluded_chars").value;

    let excluded_chars = ["[", "]", ","];

    result_div = document.getElementById("result_div");
    result_div.style.opacity = '1';
    result_div.style.margin = '15px 0 10px';
    var calculation = calculateEuler(edges, excluded_chars);
    if (calculation == "Invalid") {
        // inputTextBox.style.border = '1px solid red';
        // inputTextBox.setCustomValidity("Invalid field.");
    }
    

    edgesForCy = edges;
    for (i=0;i<excluded_chars.length;i++) {
        edgesForCy = edgesForCy.replaceAll(excluded_chars[i], "");
    }

    // nodesInTheGraph = 0;
    edgeCount = 0;
    for (i=0;i<edgesForCy.length;i=i+2) {
        let node1 = edgesForCy.charAt(i);
        let node2 = edgesForCy.charAt(i+1)
        // console.log(c + " " + edgesForCy.charAt(i) + edgesForCy.charAt(i+1))
        // nodesInTheGraph = nodesInTheGraph + 2;
        edgeCount++;

        var eles = cy.add([
            { group: 'nodes', data: { id: node1 } },
            { group: 'nodes', data: { id: node2 } },
            { group: 'edges', data: { id: 'e'+edgeCount , source: node1, target: node2 } },
        ]);
    }


    var layout = cy.layout({ name: 'circle' });
    layout.run(); 

    if (!calculation.includes('Invalid')) {

        //check if graph is connected with a BFS from one node
        var visitedNodes = 0;
        var bfs = cy.elements().bfs({
            roots: cy.nodes()[0],
            visit: function(v, e, u, i, depth){
                console.log( 'visit ' + v.id() );
                visitedNodes++;
            },
            directed: isDirected
        });

        var nodesInTheGraph = cy.elements('node');
        console.log('nodesInTheGraph ' + nodesInTheGraph.length);
        console.log('visitedNodes ' + visitedNodes);

        if (nodesInTheGraph.length != visitedNodes) {
            calculation = 'Invalid - This graph is not connected';
            console.log('NOT connected');
        } else {
            console.log('connected');
        }

    }

    resultClass = 'validResult'
    if (calculation.includes('Invalid')) {
        resultClass = 'invalidResult'
    }
    result_div.innerHTML = '<b>Result: </b>' + calculation;
    result_div.classList.add(resultClass);
    setTimeout(function(){
        result_div.classList.remove(resultClass);
    }, 1000);

}

// code for pressing enter on input
var dispatchForCode = function(event, callback) {
    var code;
    if (event.key !== undefined) {
        code = event.key;
    } else if (event.keyIdentifier !== undefined) {
        code = event.keyIdentifier;
    } else if (event.keyCode !== undefined) {
        code = event.keyCode;
    }
    callback(code);
};
document.getElementById("edges")
    .addEventListener("keydown", function(event) {
        // event.preventDefault();
        if (event.keyCode === 13) {
            document.getElementById("btn").classList.add('active');
        }
});
document.getElementById("edges")
    .addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        var btn = document.getElementById("btn");
        btn.click();
        btn.classList.remove('active');
    }
});


document.getElementById('directedDiv').addEventListener("click", function() {
    var checkbox = document.getElementById('directed-checkbox');
    var text = document.getElementById('directedDiv-text');
    if (checkbox.checked) {
        checkbox.checked = false;
        this.style.backgroundColor = '#1a3b5c';
        this.style.borderColor = 'rgb(85, 85, 85)'
        text.innerHTML = 'Undirected';
    } else {
        checkbox.checked = true;
        this.style.backgroundColor = '#306ca8';
        this.style.borderColor = 'rgb(200, 200, 200)'
        text.innerHTML = 'Directed';
    }
});

var eulerCount = 0;
const eulers = [
    'Euler the Ruler!', 
    'Euler drinks wine coolers!', 
    'Euler the Fool(er)', 
    'Euler the Drooler!',
    'Euler is cooler (than you)',
    'Euler the Jewler!',
    'Euler the Pre-schooler!',
    'Euler hangs around the water cooler!',
    'Euler the Carpooler!',
    'Euler the Overruler!',
    'Euler the Homeschooler!',
    'Euler the Pooler! <span style="font-size:12px"> (He likes swimming)</span>',
    'Euler the <a target="_blank" href="https://en.wikipedia.org/wiki/Ilya_Naishuller">Ilya Naishuller</a>!'
];
function changeEuler() {

    var euler = eulers[Math.floor(Math.random()*eulers.length)];

    document.getElementById('euler-title').innerHTML = euler;
    eulerPopup = document.getElementById('euler-popup');

    if (eulerCount == 10) {
        eulerPopup.style = 'display: block';
        setTimeout(function(){
            eulerPopup.style.opacity = '1';
        }, 200);
        setTimeout(function(){
            eulerPopup.style.opacity = '0';
        }, 3800);
        setTimeout(function(){
            eulerPopup.style = 'display: none';
        }, 4000);
    }
    eulerCount++;
}