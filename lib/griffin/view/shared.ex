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

    {tag_label, attrs, childs}
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
