defmodule Griffin.View.Client do
  @moduledoc """
  Module for rendering views on the client using React
  """

  # Takes a Griffin view and renders it into a React element.
  def to_react_el(dsl_el) do
    {tag_label, attrs, children} = Griffin.View.Shared.split_dsl_el(dsl_el)

    cond do
      # Is a text node or plain node, e.g. [:div, "foo"] or [:input]
      is_bitstring(List.first(children)) || length(children) == 0 ->
        [tag_name | _] =
          tag_label
          |> Atom.to_string()
          |> String.split("@")

        Griffin.View.React.create_element(tag_name, attrs, List.first(children))

      # Has child nodes e.g. [:form, [:input], [:button]]
      is_list(List.first(children)) ->
        Griffin.View.React.create_element(
          Atom.to_string(tag_label),
          attrs,
          children_to_react_els(children)
        )
    end
  end

  defp children_to_react_els(children) do
    Enum.map(children, fn el ->
      if is_list(List.first(el)) do
        children_to_react_els(el)
      else
        to_react_el(el)
      end
    end)
  end

  def render(view, model) do
    to_el = fn m -> to_react_el(view.render(m)) end
    component = JS.embed("({ model }) => to_el(model)")
    props = %{model: model}
    Griffin.View.React.render(component, props, "#main")
  end
end
