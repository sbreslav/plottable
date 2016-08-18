var data = [];
var dataFactor = 1000000;
var dataStartOffset = 50000000;

for (var i = 0; i < 200; i++) {
  data[i] = {
    x: new Date(i * dataFactor + dataStartOffset),
    y: (i % 50) * (i/400) + (i/100)
  };
}

var xScale = new Plottable.Scales.Time();
var yScale = new Plottable.Scales.Linear().domainMin(0);

var plot = new Plottable.Plots.Line();
plot.croppedRenderingEnabled(true);

plot.addDataset(new Plottable.Dataset(data))
  .x(function(d) {
    return d.x;
  }, xScale)
  .y(function(d) {
    return d.y;
  }, yScale)
  .attr("stroke", "blue");

var plotGroup = new Plottable.Components.Group([plot]);
var xAxis = new Plottable.Axes.Time(xScale, "bottom");
var yAxis = new Plottable.Axes.Numeric(yScale, "left");

var pzi = new Plottable.Interactions.PanZoom();
pzi.addXScale(xScale);
pzi.addYScale(yScale);
pzi.attachTo(plot);

var pziXAxis = new Plottable.Interactions.PanZoom();
pziXAxis.addXScale(xScale);
pziXAxis.attachTo(xAxis);

var pziYAxis = new Plottable.Interactions.PanZoom();
pziYAxis.addYScale(yScale);
pziYAxis.attachTo(yAxis);

new Plottable.Components.Table([
  [yAxis, plotGroup],
  [null, xAxis]
]).renderTo("svg#example");
   
$("#pan-zoom-buttons li").on("click", function(event) {
  event.preventDefault();

  $("#pan-zoom-buttons li").removeClass("selected");
  var id = $(this).attr("id");
  if (id == "pan-zoom-x") {
    pzi.xScales([xScale]);
    pzi.yScales([]);
    pziXAxis.enabled(true);
    pziYAxis.enabled(false);
  } else if (id == "pan-zoom-y") {
    pzi.xScales([]);
    pzi.yScales([yScale]);
    pziXAxis.enabled(false);
    pziYAxis.enabled(true);
  } else {
    pzi.xScales([xScale]);
    pzi.yScales([yScale]);
    pziXAxis.enabled(true);
    pziYAxis.enabled(true);
  }
  $(this).addClass("selected");
});
