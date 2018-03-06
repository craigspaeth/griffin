defmodule Griffin.View.Shared do
  @moduledoc """
  Isomorphic view functions
  """

  @doc """
  Splits a tag dsl, e.g. `[:div, [some: "attrs"], "inner"]`, into a tuple of
  tag_label, attribute map with inlined styles, and the children dsls.
  """
  def split_dsl_el(view, dsl_el) do
    [tag_label | children] = dsl_el

    attrs =
      if Keyword.keyword?(List.first(children)) do
        Enum.reduce(List.first(children), %{}, fn {k, v}, acc ->
          k = camel_case k
          Map.put(acc, k, v)
        end)
      else
        nil
      end
    [_ | childs] = if attrs != nil, do: children, else: [nil] ++ children

    styles = inline_styles(view, tag_label)
    attrs = Map.merge(attrs || %{}, %{style: styles})
    {tag_label, attrs, childs}
  end

  # Parses the first item in the DSL into an open and closing tag string
  # with inlined styles.
  defp inline_styles(view, tag_label) do
    [_ | refs] = tag_label |> Atom.to_string() |> String.split("@")

    if length(refs) > 0 do
      refs
      |> Enum.map(fn (k) ->
        Keyword.get(view.styles(nil), String.to_atom(k))
      end)
      |> Enum.reduce(%{}, fn keywords, acc ->
        Enum.reduce(keywords, %{}, fn {k, v}, acc ->
          k = camel_case k
          Map.merge acc, %{k => v}
        end)
      end)
    else
      nil
    end
  end

  defp camel_case(atom) do
    atom
    |> Atom.to_string()
    |> String.split("_")
    |> Enum.with_index()
    |> Enum.map(fn {s, i} -> if i == 0, do: s, else: String.capitalize s end)
    |> Enum.join("")
    |> String.to_atom()
  end
end
