module Plottable.Axes {
  export class Numeric extends Axis<number> {

    private _tickLabelPositioning = "center";
    private _usesTextWidthApproximation = false;
    private _measurer: SVGTypewriter.Measurers.Measurer;
    private _wrapper: SVGTypewriter.Wrappers.Wrapper;

    /**
     * Constructs a Numeric Axis.
     *
     * A Numeric Axis is a visual representation of a QuantitativeScale.
     *
     * @constructor
     * @param {QuantitativeScale} scale
     * @param {string} orientation One of "top"/"bottom"/"left"/"right".
     */
    constructor(scale: QuantitativeScale<number>, orientation: string) {
      super(scale, orientation);
      this.formatter(Formatters.general());
    }

    protected _setup() {
      super._setup();
      this._measurer = new SVGTypewriter.Measurers.Measurer(this._tickLabelContainer, Axis.TICK_LABEL_CLASS);
      this._wrapper = new SVGTypewriter.Wrappers.Wrapper().maxLines(1);
    }

    protected _computeWidth() {
      let maxTextWidth = this._usesTextWidthApproximation ? this._computeApproximateTextWidth() : this._computeExactTextWidth();

      if (this._tickLabelPositioning === "center") {
        this._computedWidth = this._maxLabelTickLength() + this.tickLabelPadding() + maxTextWidth;
      } else {
        this._computedWidth = Math.max(this._maxLabelTickLength(), this.tickLabelPadding() + maxTextWidth);
      }

      return this._computedWidth;
    }

    private _computeExactTextWidth(): number {
      let tickValues = this._getTickValues();
      let textLengths = tickValues.map((v: any) => {
        let formattedValue = this.formatter()(v);
        return this._measurer.measure(formattedValue).width;
      });

      return Utils.Math.max(textLengths, 0);
    }

    private _computeApproximateTextWidth(): number {
      let tickValues = this._getTickValues();
      let mWidth = this._measurer.measure("M").width;
      let textLengths = tickValues.map((v: number): number => {
        let formattedValue = this.formatter()(v);
        return formattedValue.length * mWidth;
      });

      return Utils.Math.max(textLengths, 0);
    }

    protected _computeHeight() {
      let textHeight = this._measurer.measure().height;

      if (this._tickLabelPositioning === "center") {
        this._computedHeight = this._maxLabelTickLength() + this.tickLabelPadding() + textHeight;
      } else {
        this._computedHeight = Math.max(this._maxLabelTickLength(), this.tickLabelPadding() + textHeight);
      }

      return this._computedHeight;
    }

    protected _getTickValues() {
      return Utils.Tick.getTickValues(<QuantitativeScale<number>> this._scale);
    }

    protected _rescale() {
      if (!this._isSetup) {
        return;
      }

      if (!this._isHorizontal()) {
        let reComputedWidth = this._computeWidth();
        if (reComputedWidth > this.width() || reComputedWidth < (this.width() - this.margin())) {
          this.redraw();
          return;
        }
      }

      this.render();
    }

    public renderImmediately() {
      super.renderImmediately();
      let tickMarkLength = this._maxLabelTickLength();
      let tickLabelPadding = this.tickLabelPadding();
      let tickLabelPositioning = this._tickLabelPositioning;
      let tickMarkAttrHash = this._generateTickMarkAttrHash();
      let tickLabelAttributes = Utils.Tick.generateTicks(tickMarkAttrHash, tickMarkLength, this.orientation(), tickLabelPadding, tickLabelPositioning);
      let tickLabelValues = this._getTickValues();
      let tickLabels = this._tickLabelContainer.selectAll("." + Axis.TICK_LABEL_CLASS).data(tickLabelValues);
      tickLabels.enter().append("text").classed(Axis.TICK_LABEL_CLASS, true);
      tickLabels.exit().remove();

      tickLabels.style("text-anchor", tickLabelAttributes.tickLabelTextAnchor)
                .style("visibility", "inherit")
                .attr(tickLabelAttributes.tickLabelAttrHash)
                .text((s: any) => this.formatter()(s));


      this._tickLabelContainer.attr("transform", tickLabelAttributes.labelGroupTransform);

      this._showAllTickMarks();

      if (!this.showEndTickLabels()) {
        this._hideEndTickLabels();
      }

      this._hideOverflowingTickLabels();
      this._hideOverlappingTickLabels();

      if (this._tickLabelPositioning !== "center") {
        this._hideTickMarksWithoutLabel();
      }
      return this;
    }

    private _showAllTickMarks() {
      Utils.Tick.showAllTickMarks(this._tickMarkContainer.selectAll("." + Axis.TICK_MARK_CLASS));
    }

    /**
     * Hides the Tick Marks which have no corresponding Tick Labels
     */
    private _hideTickMarksWithoutLabel() {
      let tickMarks = this._tickMarkContainer.selectAll("." + Axis.TICK_MARK_CLASS);
      let tickLabels = this._tickLabelContainer.selectAll("." + Axis.TICK_LABEL_CLASS);

      Utils.Tick.hideTickMarksWithoutLabel(tickMarks, tickLabels);
    }

    /**
     * Gets the tick label position relative to the tick marks.
     *
     * @returns {string} The current tick label position.
     */
    public tickLabelPosition(): string;
    /**
     * Sets the tick label position relative to the tick marks.
     *
     * @param {string} position "top"/"center"/"bottom" for a vertical Numeric Axis,
     *                          "left"/"center"/"right" for a horizontal Numeric Axis.
     * @returns {Numeric} The calling Numeric Axis.
     */
    public tickLabelPosition(position: string): Numeric;
    public tickLabelPosition(position?: string): any {
      if (position == null) {
        return this._tickLabelPositioning;
      } else {
        let positionLC = position.toLowerCase();
        if (this._isHorizontal()) {
          if (!(positionLC === "left" || positionLC === "center" || positionLC === "right")) {
            throw new Error(positionLC + " is not a valid tick label position for a horizontal NumericAxis");
          }
        } else {
          if (!(positionLC === "top" || positionLC === "center" || positionLC === "bottom")) {
            throw new Error(positionLC + " is not a valid tick label position for a vertical NumericAxis");
          }
        }
        this._tickLabelPositioning = positionLC;
        this.redraw();
        return this;
      }
    }

    /**
     * Gets the approximate text width setting.
     *
     * @returns {boolean} The current text width approximation setting.
     */
    public usesTextWidthApproximation(): boolean;
    /**
     * Sets the approximate text width setting. Approximating text width
     * measurements can drastically speed up plot rendering, but the plot may
     * have extra white space that would be eliminated by exact measurements.
     * Additionally, very abnormal fonts may not approximate reasonably.
     *
     * @param {boolean} The new text width approximation setting.
     * @returns {Axes.Numeric} The calling Axes.Numeric.
     */
    public usesTextWidthApproximation(enable: boolean): Axes.Numeric;
    public usesTextWidthApproximation(enable?: boolean): any {
      if (enable == null) {
        return this._usesTextWidthApproximation;
      } else {
        this._usesTextWidthApproximation = enable;
        return this;
      }
    }

    private _hideEndTickLabels() {
      let boundingBox = (<Element> this._boundingBox.node()).getBoundingClientRect();
      let tickLabels = this._tickLabelContainer.selectAll("." + Axis.TICK_LABEL_CLASS);
      Utils.Tick.hideEndTickLabels(tickLabels, boundingBox);
    }

    // Responsible for hiding any tick labels that break out of the bounding container
    private _hideOverflowingTickLabels() {
      let boundingBox = (<Element> this._boundingBox.node()).getBoundingClientRect();
      let tickLabels = this._tickLabelContainer.selectAll("." + Axis.TICK_LABEL_CLASS);
      Utils.Tick.hideOverflowingTickLabels(tickLabels, boundingBox);
    }

    private _hideOverlappingTickLabels() {
      let tickLabels = this._tickLabelContainer.selectAll("." + Axis.TICK_LABEL_CLASS);
      Utils.Tick.hideOverlappingTickLabels(tickLabels, this.orientation(), this._tickLabelPositioning, this.tickLabelPadding());
    }

  }
}
