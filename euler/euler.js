// cytoscape.js notice:
// Copyright (c) 2016-2021, The Cytoscape Consortium.
// THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

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


var odd = 0;
var uniqueVertexCount = 0;
var nodesWithOddDegree = [];
var edgeCount = 0
function calculateEuler(edges, excluded_chars) {
    //object to store edge count for each character in the edges string
    var counts = {};
    //variables
    var ch, index, len, count, result;
    edgeCount = 0;
    odd = 0;
    vertexCount = 0;
    nodesWithOddDegree = [];

    if (edges == null) {
        return "Undefined";
    }

    // loop through each character in the edges string
    for (index = 0, len = edges.length; index < len; ++index) {
        ch = edges.charAt(index);
        let excluded = false;
        // check if character is excluded
        if (excluded_chars != null) {
            excluded_chars.forEach(excluded_char => {
                if (ch == excluded_char) {
                    excluded = true;
                }
            });
        }
        // increase count of vertex
        if (!excluded) {
            count = counts[ch];
            counts[ch] = count ? count + 1 : 1;
            edgeCount++;
        }
    }
    
    // count the number of vertices with an odd degree
    for (ch in counts) {
        if (counts[ch] % 2 == 1) {
            odd++;
            if(nodesWithOddDegree.indexOf(ch) === -1) {
                nodesWithOddDegree.push(ch);
            }
        }
        vertexCount++;
    }
    if (vertexCount == 0) {
        return "Invalid - no verticies";
    }
    console.log(vertexCount)
    if (vertexCount == 1 && edgeCount == 2) {
        return "Euler Circuit (and Path) - Self Loop"
    }
    if (edgeCount == 1) {
        return "Invalid - Edge not defined"
    }
    if (odd <= 2) {
        result = "Euler Path";
    }
    if (odd == 0) {
        result = "Euler Circuit (and Path)";
    }
    if (result == null) {
        result = "No Euler Path in this Graph";
    }
    return result;
}

// calculate button
function calculateBtn() {
    document.getElementById("btn").style.pointerEvents = 'none';
    // showResultInfo(true);

    // initilise and reset cy
    var isDirected = document.getElementById('directed-checkbox').checked;
    var cy = initCy(isDirected);
    var collection = cy.elements('node');
    cy.remove( collection );

    // variables and styles
    document.getElementById('cy').style.backgroundColor = 'rgba(255, 255, 255, 0.4)';

    let inputTextBox = document.getElementById("edges");
    let edges = inputTextBox.value;
    //remove line breaks and spaces
    console.log('edges before: ' + edges)
    edges = edges.replace(/\r?\n|\r/g, '').trim();
    console.log('edges after: ' + edges)
    let excluded_chars = ["[", "]", ",", "{", "}", "(", ")", " "];

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
            { group: 'nodes', data: { id: node1 }, position: { x: -50, y: -50 } },
        ]);
        if (node2 != '') {
            cy.add([
                { group: 'nodes', data: { id: node2 }, position: { x: -50, y: -50 } },
                { group: 'edges', data: { id: 'e'+edgeCount , source: node1, target: node2 } },
            ])
            edgeCount++;
        }
    }

    // start cy
    var layout = 'cose';
    if (edges.length > 500) {
        layout = 'circle';
    }
    if (edges.length > 5000) {
        bigComputer = confirm('That graph is massive! Are you on a big computer? (this alert makes no difference as code will run anyway)');
        if (bigComputer) {
            calculation = calculation + " - AND you're on a big computer! Nice!"
        } else {
            calculation = calculation + " - BUT you're on a small computer! Loser!"
        }
    }
    var layout = cy.layout({ name: layout });
    layout.run(); 

    var visitedNodes = 0;
    var visitedNodesInPath = 0;
    var nodesInTheGraph = cy.elements('node');

    if (!calculation.includes('Invalid')) {

        //check if graph is connected with a BFS from all nodes
        visitedNodesString = '';
        for (index=0;index<nodesInTheGraph.length;index++) {
            visitedNodesInPath = 0;
            var bfs = cy.elements().bfs({
                roots: nodesInTheGraph[index],
                visit: function(v, e, u, i, depth){
                    console.log( 'visit ' + v.id() );
                    visitedNodesInPath++;
                    console.log('i' + index)
                    console.log('id  ' + nodesInTheGraph[index].id())
                    console.log('nodes in graph ' + nodesInTheGraph.length);
                    console.log('visited nodes in path: ' + visitedNodesInPath)
                    if (visitedNodesInPath == nodesInTheGraph.length) {
                        visitedNodes++;
                        visitedNodesString = visitedNodesString + nodesInTheGraph[index].id() + ", ";
                        visitedNodesInPath = 0;
                    }
                },
                directed: isDirected
            });
        }

        console.log(calculation);
        if (nodesInTheGraph.length != visitedNodes) {
            calculation = 'Invalid - This graph is not connected';
        }

    }

    var moreInfo = '<br>';

    // if (nodesWithOddDegree <= 2) {
    //     var condition1 = true;
    // } else {
    //     var condition1 = false;
    // }
    // moreInfo += '<b>1. Two or less verticies with an odd degree: ' + condition1 + '</b><br>';

    if (visitedNodes != 0) {
        moreInfo += 'Nodes which have a path to all other nodes (BFS): ' + visitedNodesString.substring(0, visitedNodesString.length - 2)
        + '<br>Nodes which have a path to all other nodes (BFS) count: ' + visitedNodes + '<br>';
    }
    moreInfo += 'Edge count: ' + edgeCount + '<br>';
    moreInfo += 'Node count: ' + vertexCount + '<br>';
    if (vertexCount > 1) {
        moreInfo += 'Nodes with odd degree count : ' + nodesWithOddDegree.length + '<br>';
        if (nodesWithOddDegree.length != 0) {
            moreInfo += 'Nodes with odd degree: ' + nodesWithOddDegree + '<br>';
            moreInfo += 'Total odd degree count for all nodes: ' + odd + '<br>';
        }
    }

    document.getElementById("result-more-info").innerHTML = moreInfo;
    // display result
    resultClass = 'validResult';
    if (calculation.includes('Invalid')) {
        resultClass = 'invalidResult';
    }
    else if (calculation.includes("No Euler Path in this Graph")) {
        resultClass = 'noResult';
    }
    document.getElementById("result_div-text").innerHTML = '<b>Result: </b>' + calculation;
    result_div.classList.add(resultClass);
    setTimeout(function(){
        result_div.classList.remove(resultClass);
    }, 1000);

    document.getElementById("btn").style.pointerEvents = 'auto';
}

var moreInfoMaxHeight = "1px";
function showResultInfo(collapse = false) {
    resultInfo = document.getElementById("result-more-info");
    if (resultInfo != null) {
        if (resultInfo.style.maxHeight == '400px' || collapse) {
            resultInfo.style.maxHeight = "1px";
        } else {
            resultInfo.style.maxHeight = "400px";
            var height = resultInfo.offsetHeight;
        }
    }
}


// pressing enter on input textbox
document.getElementById("edges")
    .addEventListener("keydown", function(event) {
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
            document.getElementById("btn").classList.add('active');
        }
});
document.getElementById("edges")
    .addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13 && !event.shiftKey) {
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
        this.style.borderColor = 'rgb(78, 78, 78)'
        text.innerHTML = 'Undirected';
    } else {
        checkbox.checked = true;
        this.style.backgroundColor = '#306ca8';
        this.style.borderColor = 'rgb(140, 140, 140)'
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
var oiler = false;
function setOiler() {
    oiler = true;
    document.getElementById('euler-title').innerHTML = oilers[0];
    eulerPopup.style.display = 'none';
}
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
const oilers = [
    'Euler the oiler!',
    'Euler the soil(er)',
    'Euler the broiler!',
    'Euler the toiler!',
    'Euler the recoiler!',
    'Euler the double boiler!',
    'Euler the <a target="_blank" href="https://www.dictionary.com/browse/despoiler">despoiler</a>!',
    'Euler is in turmoil(er)',
    'Euler gives away all the spoiler(s)',
    'Euler the pan-broiler!',
    "Euler doesn't have the lastname Boyle(r)",
    "Euler likes to spoil her! <span style='font-size:12px'>(<i>her</i> reffering to Euler's significant other)</span>",
];
var eulerCount = 0;
function changeEuler() {
    eulerTitle = document.getElementById('euler-title');
    prevEuler = eulerTitle.innerHTML;
    if (oiler) {
        var euler = oilers[Math.floor(Math.random()*oilers.length)];
        while (prevEuler == euler) {
            var euler = oilers[Math.floor(Math.random()*oilers.length)];
        }
    } else {
        var euler = eulers[Math.floor(Math.random()*eulers.length)];
        while (prevEuler == euler) {
            var euler = eulers[Math.floor(Math.random()*eulers.length)];
        }
    }

    eulerTitle.innerHTML = euler;
    eulerPopup = document.getElementById('euler-popup');

    if (eulerCount == 9) {
        eulerPopup.style.display = 'block';
        setTimeout(function(){
            eulerPopup.style.opacity = '0';
        }, 8000);
        setTimeout(function(){
            eulerPopup.style.display = 'none';
        }, 8400);
    }
    eulerCount++;
}