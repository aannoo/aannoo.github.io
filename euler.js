function initCy(isDirected) {
    if (isDirected) {
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
            rows: 1,        }
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
    // nitilise and reset cy
    var isDirected = document.getElementById('directed-checkbox').checked;
    var cy = initCy(isDirected);
    var collection = cy.elements('node');
    cy.remove( collection );

    // variables and styles
    document.getElementById('cy').style.backgroundColor = 'rgba(255, 255, 255, 0.4)';

    let inputTextBox = document.getElementById("edges");
    let edges = inputTextBox.value;
    // let excluded_chars = document.getElementById("excluded_chars").value;
    let excluded_chars = ["[", "]", ","];

    result_div = document.getElementById("result_div");
    result_div.style.opacity = '1';
    result_div.style.margin = '15px 0 10px';

    // start calculation
    var calculation = calculateEuler(edges, excluded_chars);

    // input data into cy
    edgesForCy = edges;
    for (i=0;i<excluded_chars.length;i++) {
        edgesForCy = edgesForCy.replaceAll(excluded_chars[i], "");
    }

    edgeCount = 0;
    for (i=0;i<edgesForCy.length;i=i+2) {
        let node1 = edgesForCy.charAt(i);
        let node2 = edgesForCy.charAt(i+1)

        cy.add([
            { group: 'nodes', data: { id: node1 } },
            { group: 'nodes', data: { id: node2 } },
            { group: 'edges', data: { id: 'e'+edgeCount , source: node1, target: node2 } },
        ]);

        edgeCount++;
    }

    // start cy
    var layout = cy.layout({ name: 'circle' });
    layout.run(); 

    if (!calculation.includes('Invalid')) {

        //check if graph is connected with a BFS from a node
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

        if (nodesInTheGraph.length != visitedNodes) {
            calculation = 'Invalid - This graph is not connected';
        }

    }

    // display result
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

// pressing enter on input textbox
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


// directed checkbox
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


// info accordian
document.getElementById('info-arrow').addEventListener("click", function() {
    info = document.getElementById('info');
    infoArrowText = document.getElementById('info-arrow-text');
    infoArrow = document.getElementById('arrow');
    if (info.style.maxHeight == '0px') {
        info.style.maxHeight = '400px';
        infoArrowText.style.opacity = '0';
        infoArrowText.style.display = 'none';
        infoArrow.classList.add('arrow-down');
    } else {
        info.style.maxHeight = '0px';
        infoArrowText.style.display = 'inline-block';
        setTimeout(function(){
            infoArrowText.style.opacity = '1';
            infoArrow.classList.remove('arrow-down');
        }, 200);
    }
    
});


// euler heading text
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
    'Euler the Tool(er)',
    'Euler the Pooler! <span style="font-size:12px"> (He likes swimming)</span>',
    'Euler the <a target="_blank" href="https://en.wikipedia.org/wiki/Ilya_Naishuller">Ilya Naishuller</a>!'
];
function changeEuler() {
    eulerTitle = document.getElementById('euler-title');
    prevEuler = eulerTitle.innerHTML;
    var euler = eulers[Math.floor(Math.random()*eulers.length)];
    while (prevEuler == euler) {
        var euler = eulers[Math.floor(Math.random()*eulers.length)];
    }

    eulerTitle.innerHTML = euler;
    eulerPopup = document.getElementById('euler-popup');

    if (eulerCount == 9) {
        eulerPopup.style.display = 'block';
        setTimeout(function(){
            eulerPopup.style.opacity = '0';
        }, 7000);
        setTimeout(function(){
            eulerPopup.style.display = 'none';
        }, 7400);
    }
    eulerCount++;
}