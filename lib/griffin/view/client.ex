defmodule Griffin.View.Client do
  @moduledoc """
  Module for rendering views on the client using React
  """

  # Takes a Griffin view and renders it into a React element.
  def to_react_el(view, dsl_el) do
    {tag_label, attrs, children} = Griffin.View.Shared.split_dsl_el(view, dsl_el)

    cond do
      is_bitstring(List.first(children)) ->
        [tag_name | _] =
          tag_label
          |> Atom.to_string()
          |> String.split("@")
        Griffin.View.React.text_node(tag_name, attrs, List.first(children))

      is_list(List.first(children)) ->
        children_to_react_els(view, children)

      true ->
        Enum.map(children, fn el -> to_react_el(view, el) end)
    end
  end

  defp children_to_react_els(view, children) do
    Enum.map(children, fn el ->
      if is_list(List.first(el)) do
        children_to_react_els(view, el)
      else
        to_react_el(view, el)
      end
    end)
  end

  def render(view, model) do
    el = to_react_el(view, view.render(model))
    Griffin.View.React.render(el, "#main")
  end
end
