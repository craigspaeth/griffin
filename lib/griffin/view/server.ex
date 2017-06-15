defmodule Griffin.View.Server do
  @moduledoc """
  Module for rendering views on the server
  """

  @doc """
  Takes a Griffin view and renders it to HTML given a view model

  ## Examples
    iex> render View, %{name: "Harry Potter"}
    iex> "<div>Hello Harry Potter</div>"

  """
  def render(view, model) do
    to_html view, view.render model
  end

  # Given an element in a view DSL it will convert it into HTML, recursively
  # generating the children of that DSL until a full HTML tree is output.
  defp to_html(view, el) do
    if is_bitstring el do
      el
    else
      [tag_label | children] = el
      {open, close} = split_tag_label view, tag_label
      children = children
      |> Enum.map(fn (child) -> to_html view, child end)
      |> Enum.join("")
      "#{open}#{children}#{close}"
    end
  end

  # Parses the first item in the DSL into an open and closing tag string
  # with inlined styles.
  defp split_tag_label(view, tag) do
    [tag_name | refs] = tag |> to_string |> String.split("@")
    inline_styles = if length(refs) > 0 do
      styles = refs
      |> Enum.map(&view.styles[String.to_atom &1])
      |> Enum.reduce(fn (style_map, acc) -> Map.merge acc, style_map end)
      |> Map.to_list
      |> Enum.map(fn ({k, v}) -> "#{k}: #{v}" end)
      |> Enum.join("; ")
      " style=\"#{styles}\""
    else
      ""
    end
    {"<#{tag_name}#{inline_styles}>", "</#{tag_name}>"}
  end
end