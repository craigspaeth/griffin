defmodule Griffin.View.Client do
  @moduledoc """
  Module for rendering views on the client using React
  """

  # Takes a Griffin view and renders it into a React element.
  def to_react_el(view, dsl_el) do
    [tag_label | children] = dsl_el

    attrs =
      if Keyword.keyword?(List.first(children)) do
        Enum.reduce(List.first(children), %{}, fn {k, v}, acc ->
          Map.put(acc, k, v)
        end)
      else
        nil
      end

    [_ | childs] = if attrs != nil, do: children, else: [nil] ++ children

    styles = inline_styles(view, tag_label)
    attrs = Map.merge(attrs, %{style: styles})

    r = cond do
      is_bitstring(List.first(childs)) ->
        [tag_name | _] =
          tag_label
          |> Atom.to_string()
          |> String.split("@")
        Griffin.View.React.text_node(tag_name, attrs, List.first(childs))

      is_list(List.first(childs)) ->
        children_to_react_els(view, childs)

      true ->
        Enum.map(childs, fn el -> to_react_el(view, el) end)
    end
    r
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

  # Parses the first item in the DSL into an open and closing tag string
  # with inlined styles.
  defp inline_styles(view, tag_label) do
    [_ | refs] = tag_label |> Atom.to_string() |> String.split("@")

    if length(refs) > 0 do
      refs
      |> Enum.map(fn (k) ->
        Keyword.get(view.styles(nil), k)
      end)
      |> Enum.reduce(%{}, fn {_, v}, acc ->
        Enum.reduce(v, %{}, fn {k, v} ->
          k = String.replace(Atom.to_string(k), "_", "-")
          %{k => v}
        end)
      end)
    else
      nil
    end
  end

  def render(view, model) do
    el = to_react_el(view, view.render(model))
    Griffin.View.React.render(el, "#main")
  end
end
