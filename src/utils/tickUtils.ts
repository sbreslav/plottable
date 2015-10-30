module Plottable.Utils.Tick {

  export type AttributeHash = { [key: string]: number | string | ((d: any) => number) };
  export function getTickValues(scale: QuantitativeScale<any> | Scales.InterpolatedColor) {
    let domain = scale.domain();
    if (!QuantitativeScale.prototype.isPrototypeOf(scale) || Scales.InterpolatedColor.prototype.isPrototypeOf(scale)) {
      return domain;
    }
    let ticks = scale.ticks();
    return Utils.Math.valuesInDomain(ticks, domain);
  };


  export function generateTicks(tickMarkAttrHash: AttributeHash, tickMarkLength: number, orientation: string, tickLabelPadding: number, tickLabelPositioning: string) {
    let tickLabelAttrHash: AttributeHash = {
      x: <any> 0,
      y: <any> 0,
      dx: "0em",
      dy: "0.3em"
    };

    let labelGroupTransformX = 0;
    let labelGroupTransformY = 0;
    let labelGroupShiftX = 0;
    let labelGroupShiftY = 0;
    let tickLabelTextAnchor = "middle";

    if (orientation === "top" || orientation === "bottom") {
      switch (tickLabelPositioning) {
        case "left":
          tickLabelTextAnchor = "end";
          labelGroupTransformX = -tickLabelPadding;
          labelGroupShiftY = tickLabelPadding;
          break;
        case "center":
          labelGroupShiftY = tickMarkLength + tickLabelPadding;
          break;
        case "right":
          tickLabelTextAnchor = "start";
          labelGroupTransformX = tickLabelPadding;
          labelGroupShiftY = tickLabelPadding;
          break;
      }
    } else {
      switch (tickLabelPositioning) {
        case "top":
          tickLabelAttrHash["dy"] = "-0.3em";
          labelGroupShiftX = tickLabelPadding;
          labelGroupTransformY = -tickLabelPadding;
          break;
        case "center":
          labelGroupShiftX = tickMarkLength + tickLabelPadding;
          break;
        case "bottom":
          tickLabelAttrHash["dy"] = "1em";
          labelGroupShiftX = tickLabelPadding;
          labelGroupTransformY = tickLabelPadding;
          break;
      }
    }

    switch (orientation {
      case "bottom":
        tickLabelAttrHash["x"] = tickMarkAttrHash["x1"];
        tickLabelAttrHash["dy"] = "0.95em";
        labelGroupTransformY = <number> tickMarkAttrHash["y1"] + labelGroupShiftY;
        break;

      case "top":
        tickLabelAttrHash["x"] = tickMarkAttrHash["x1"];
        tickLabelAttrHash["dy"] = "-.25em";
        labelGroupTransformY = <number> tickMarkAttrHash["y1"] - labelGroupShiftY;
        break;

      case "left":
        tickLabelTextAnchor = "end";
        labelGroupTransformX = <number> tickMarkAttrHash["x1"] - labelGroupShiftX;
        tickLabelAttrHash["y"] = tickMarkAttrHash["y1"];
        break;

      case "right":
        tickLabelTextAnchor = "start";
        labelGroupTransformX = <number> tickMarkAttrHash["x1"] + labelGroupShiftX;
        tickLabelAttrHash["y"] = tickMarkAttrHash["y1"];
        break;
    }
    let labelGroupTransform = "translate(" + labelGroupTransformX + ", " + labelGroupTransformY + ")";

    return {
      "tickMarkAttrHash": tickMarkAttrHash,
      "tickLabelTextAnchor": tickLabelTextAnchor,
      "tickLabelAttrHash": tickLabelAttrHash,
      "labelGroupTransform": labelGroupTransform,
    };
  };

  export function generateTickMarkAttrHash(scale: Plottable.Scale<any, any>, width: number, height: number, orientation: string, tickLength: number) {
    let tickMarkAttrHash: AttributeHash = {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0
    };

    let scalingFunction = (d: any) => scale.scale(d);
    if (orientation === "top" || orientation === "bottom") {
      tickMarkAttrHash["x1"] = scalingFunction;
      tickMarkAttrHash["x2"] = scalingFunction;
    } else {
      tickMarkAttrHash["y1"] = scalingFunction;
      tickMarkAttrHash["y2"] = scalingFunction;
    }


    switch (orientation) {
      case "bottom":
        tickMarkAttrHash["y2"] = tickLength;
        break;

      case "top":
        tickMarkAttrHash["y1"] = height;
        tickMarkAttrHash["y2"] = height - tickLength;
        break;

      case "left":
        tickMarkAttrHash["x1"] = width;
        tickMarkAttrHash["x2"] = width - tickLength;
        break;

      case "right":
        tickMarkAttrHash["x2"] = tickLength;
        break;
    }

    return tickMarkAttrHash;
  };

  /**
   * Filters out visible selections
   */
  export function visibleFilter(selection: d3.Selection<any>) {
    return selection.filter(function(d: any, i: number) {
      let visibility = d3.select(this).style("visibility");
      return (visibility === "inherit") || (visibility === "visible");
    });
  };

  /**
   *  Hides the Tick Marks which have no corresponding Tick Labels
   */
  export function hideTickMarksWithoutLabel(tickMarks: d3.Selection<any>, tickLabels: d3.Selection<any>) {
    let labelNumbersShown: Set<number> = new Set<number>();
    visibleFilter(tickLabels).each((labelNumber: number) => labelNumbersShown.add(labelNumber));
    tickMarks.each(function(e, i) {
      if (labelNumbersShown.has(e)) {
          d3.select(this).style("visibility", "hidden");
      }
    });
  };

  /**
   *  Hides end ticks that are outside of boundingBox
   */
  export function hideEndTickLabels(tickLabels: d3.Selection<any>, boundingBox: ClientRect) {
    if (tickLabels.empty()) {
      return;
    }
    let firstTickLabel = <Element> tickLabels[0][0];
    if (!Utils.DOM.clientRectInside(firstTickLabel.getBoundingClientRect(), boundingBox)) {
      d3.select(firstTickLabel).style("visibility", "hidden");
    }
    let lastTickLabel = <Element> tickLabels[0][tickLabels[0].length - 1];
    if (!Utils.DOM.clientRectInside(lastTickLabel.getBoundingClientRect(), boundingBox)) {
      d3.select(lastTickLabel).style("visibility", "hidden");
    }
  };

  /**
   *  Hides ticks that are outside of boundingBox
   */
  export function hideOverflowingTickLabels(tickLabels: d3.Selection<any>, boundingBox: ClientRect) {
    if (tickLabels.empty()) {
      return;
    }
    tickLabels.each(function(d: any, i: number) {
      if (!Utils.DOM.clientRectInside(this.getBoundingClientRect(), boundingBox)) {
        d3.select(this).style("visibility", "hidden");
      }
    });
  };

  export function hideOverlappingTickLabels(tickLabels: d3.Selection<any>, orientation: string, tickLabelPositioning: string, defaultPadding: number) {
    let visibleTickLabels = visibleFilter(tickLabels);

    let visibleTickLabelRects = visibleTickLabels[0].map((label: HTMLScriptElement) => label.getBoundingClientRect());
    let interval = 1;

    while (hasOverlapWithInterval(interval, visibleTickLabelRects) && interval < visibleTickLabelRects.length) {
      interval += 1;
    }

    visibleTickLabels.each(function (d: string, i: number) {
      let tickLabel = d3.select(this);
      if (i % interval !== 0) {
        tickLabel.style("visibility", "hidden");
      }
    });

    /**
     * The method is responsible for evenly spacing the labels on the axis.
     * @return test to see if taking every `interval` recrangle from `rects`
     * will result in labels not overlapping
     *
     * For top, bottom, left, right positioning of the ticks, we want the padding
     * between the labels to be 3x, such that the label will be  `padding` distance
     * from the tick and 2 * `padding` distance (or more) from the next tick
     *
     */
    function hasOverlapWithInterval(interval: number, rects: ClientRect[]) {
      let padding = defaultPadding;
      if (tickLabelPositioning !== "center") {
        padding *= 3;
      }

      for (let i = 0; i < rects.length - (interval); i += interval) {
        let currRect = rects[i];
        let nextRect = rects[i + interval];
        if (orientation === "top" || orientation === "bottom") {
          if (currRect.right + padding >= nextRect.left) {
            return true;
          }
        } else {
          if (currRect.top - padding <= nextRect.bottom) {
            return true;
          }
        }
      }
      return false;
    };
  };

  export function showAllTickMarks(tickMarks: d3.Selection<any>) {
    tickMarks.each(function() {
      d3.select(this).style("visibility", "inherit");
    });
  }
}
