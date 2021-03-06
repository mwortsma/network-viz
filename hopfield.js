var dataset = [];
var n = 0;
var E = [];
var V = [];


var w = 800;
var h = 400;
var animationDuration = 300;

var running = false;



function getRow(i){
    return Math.floor(i/n);
}

function getCol(i) {
    return i % n;
}

function getX(i) {
    return 200 - 140*Math.cos(2*Math.PI*i/n);
}

function getY(i) {
    return 200 - 140*Math.sin(2*Math.PI*i/n);
}


function validBinaryStr(binaryStr){
    if(binaryStr.length < 2){
        alert('Vectors must be > 1 dimensional.');
        return false;
    }

    for (var i = 0, len = binaryStr.length; i < len; i++) {
        if( binaryStr[i] != '1' && binaryStr[i] != 0 ){
            alert('Must enter a binary string.');
            return false;
        }
    }
    return true;
}


function handleClick(event){
    var binaryStr = document.getElementById("myVal").value;
    if(!validBinaryStr(binaryStr)){
        return false;
    }
    draw(binaryStr);
    return false;
}

function strToVec(val) {
    vec = [];
    for (var i = 0, len = val.length; i < len; i++) {
        vec.push(Number(val[i]));
    }
    return vec;
}

function vecToStr(val) {
    return val.toString().replace(/,/g, '');
}

function draw(val){
    d3.select("body").select("ul").append("li");
    dataset.push(strToVec(val));
    var p = d3.select("body").selectAll("li")
    .data(dataset)
    .text(function(d,i){return i + ": " + vecToStr(d);})
}

function initEdges() {
    datasetLength = dataset.length;
    for(var k = 0; k < datasetLength; k++) {
        for(var i = 0; i < n; i++){
            for(var j = 0; j < n; j++){
                if(i != j){
                    if(dataset[k][i] == dataset[k][j]){
                        E[i][j] = E[i][j] + (1/datasetLength);
                    } else {
                        E[i][j] = E[i][j] + (-1/datasetLength);
                    }
                }
            }
        }
    }
}

function handleInit(event) {
    if(dataset.length == 0){
        alert("Must complete step 1 first.");
        return false;
    }

    var binaryStr = document.getElementById("myVal2").value;
    if(!validBinaryStr(binaryStr)){
        return false;
    }
    V = strToVec(binaryStr);
    n = V.length;
    for(var j = 0; j < dataset.length; j++){
        if(dataset[j].length > n){
            n = dataset[j].length;
            while(V.length < n){
                V.push(0);
            }
        }
    }
    for(var j = 0; j < dataset.length; j++){
        while(dataset[j].length < n){
            dataset[j].push(0);
        }
    }

    E = [];
    for(var i = 0; i < n; i++){
        E.push(new Float32Array(n));
    }
    try {
        initEdges();
    } catch(err) {
        return false;
    }
    init();
    return false;
}

var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);


function drawNodes(data) {

    // DATA JOIN
    // Join new data with old elements, if any.
    var nodes = svg.selectAll("circle")
                 .data(data);

    // UPDATE
    // Update old elements as needed.
    nodes.attr("class", "update");

    function stateToColor(n) { 
        if(n == 1) { return "black"; } 
        else { return "white"; }
    }

    // ENTER
    // Create new elements as needed.
    //
    // ENTER + UPDATE
    // After merging the entered elements with the update selection,
    // apply operations to both.
    nodes.enter()
     .append("circle")
         .attr("class", "enter")
     .merge(nodes)
         .transition()
         .duration(animationDuration)
         .style("stroke", "gray")
         .style("fill", function(d) { return stateToColor(d); })
         .attr("cx", function(d, i) { return getX(i); })
         .attr("cy", function(d, i) { return getY(i); })
         .attr("r", 10);

    // EXIT
    // Remove old elements as needed.
    nodes.exit().remove();
}


function drawEdges(data) {

    // DATA JOIN
    // Join new data with old elements, if any.
    var edges = svg.selectAll("g")
                 .data(data)

    // UPDATE
    // Update old elements as needed.
    edges.attr("class", "update");

    // ENTER
    // Create new elements as needed.
    //
    // ENTER + UPDATE
    // After merging the entered elements with the update selection,
    // apply operations to both.
    edges.enter()
     .append("line")
         .attr("class", "enter")
     .merge(edges)
         .attr("x1", function(d, i) { return getX(getRow(i)); })
         .attr("x2", function(d, i) { return getX(getCol(i)); })
         .attr("y1", function(d, i) { return getY(getRow(i)); })
         .attr("y2", function(d, i) { return getY(getCol(i)); })
        .style("stroke", function(d) {/*console.log(d.toFixed(2));*/ if(d > 0){return "skyblue";}else if(d < 0){return "tomato";}else{return "grey"}} )

    // EXIT
    // Remove old elements as needed.
    edges.exit().remove();
}

function drawText(){
    var elements = document.getElementsByClassName("text-delete");
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
    var textToAdd = "Result: " + vecToStr(V);
    var color = "black";
    for(var i = 0; i < dataset.length; i++){
        if(dataset[i].toString() == V.toString()){
            textToAdd = textToAdd + " ... Staus - Matches ID " + i.toString();
            color = "green";
        }
    }
    svg.append("text").attr("class", "text-delete").text(textToAdd).attr("x", 10).attr("y", h-10).style("fill", color);
}


function update() {
    drawNodes(V);
    drawText();
}

var initialized = false;

function init() {

    flat = new Float32Array(n*n);
    for(var i = 0; i < n; i++){
        for(var j = 0; j < n; j++){
            flat[n*i + j] = E[i][j];
        }
    }
    drawEdges(flat);

    update();

    svg.selectAll("text")
        .data(V)
        .enter()
        .append("text")
        .text(function(d, i) { return i; })
        .attr("x", function(d, i) { return getX(i) + 15; })
        .attr("y", function(d, i) { return getY(i) - 15; });

    initialized = true;
}


function run() {
    if(dataset.length == 0 || !initialized){
        alert("Must complete step 1 and 2 first.");
        return false;
    }
    if(running){ return; }
    d3.interval(function() {
      
      newV = [];
      for(var i = 0; i < n; i++){
        sum = 0;
        for(var j = 0; j < n; j++){
            sum = sum + E[i][j]*(-1 + 2*V[j]);
        }
        if(sum >= 0){
            newV.push(1);
        } else {
            newV.push(0);
        }
      }

      for(var i = 0; i < n; i++){
        V[i] = newV[i];
      }

      update();

    }, 1500);
    running = true;
}

