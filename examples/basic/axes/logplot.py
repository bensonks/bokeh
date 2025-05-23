''' A log plot using functions with different growth rates. This example
demonstrates using a log axis on a Bokeh plot. Various line styles and glyph
combinations are automatically added to a legend.

.. bokeh-example-metadata::
    :apis: bokeh.plotting.figure.scatter, bokeh.plotting.figure.line
    :refs: :ref:`ug_basic_lines_with_markers`
    :keywords: lines, legend, log scale, scatter

'''
import numpy as np

from bokeh.plotting import figure, show

x = np.linspace(0.1, 5, 80)

p = figure(title="log axis example", y_axis_type="log",
           x_range=(0, 5), y_range=(0.001, 10.0**22),
           background_fill_color="#fafafa")

p.line(x, np.sqrt(x), legend_label="y=sqrt(x)",
       line_color="tomato", line_dash="dashed")

p.line(x, x, legend_label="y=x")
p.scatter(x, x, legend_label="y=x")

p.line(x, x**2, legend_label="y=x**2")
p.scatter(x, x**2, legend_label="y=x**2",
          fill_color=None, line_color="olivedrab")

p.line(x, 10**x, legend_label="y=10^x",
       line_color="gold", line_width=2)

p.line(x, x**x, legend_label="y=x^x",
       line_dash="dotted", line_color="indigo", line_width=2)

p.line(x, 10**(x**2), legend_label="y=10^(x^2)",
       line_color="coral", line_dash="dotdash", line_width=2)

p.legend.location = "top_left"

show(p)
