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
    to_html(view, model, view.render(model))
  end

  # Given an element in a view DSL it will convert it into HTML, recursively
  # generating the children of that DSL until a full HTML tree is output.
  defp to_html(view, model, el) do
    cond do
      is_bitstring(el) ->
        el

      is_list(List.first(el)) ->
        el
        |> Enum.map(fn child -> to_html(view, model, child) end)
        |> Enum.join("")

      is_list(el) ->
        [tag_label | children] = el
        has_els_func = not is_nil(view.__info__(:functions)[:els])

        if has_els_func and not is_nil(view.els[tag_label]) do
          to_html(view, model, view.els[tag_label].render(model))
        else
          {open, close} = split_tag_label(view, tag_label)

          children =
            children
            |> Enum.map(fn child -> to_html(view, model, child) end)
            |> Enum.join("")

          "#{open}#{children}#{close}"
        end
    end
  end

  # Parses the first item in the DSL into an open and closing tag string
  # with inlined styles.
  defp split_tag_label(view, tag) do
    [tag_name | refs] = tag |> to_string |> String.split("@")

    inline_styles =
      if length(refs) > 0 do
        styles =
          refs
          |> Enum.map(&view.styles[String.to_atom(&1)])
          |> Enum.reduce(fn style_map, acc -> Keyword.merge(acc, style_map) end)
          |> Enum.reverse()
          |> Enum.map(fn {k, v} ->
            k = String.replace(to_string(k), "_", "-")
            "#{k}: #{v}"
          end)
          |> Enum.join("; ")

        " style=\"#{styles}\""
      else
        ""
      end

    {"<#{tag_name}#{inline_styles}>", "</#{tag_name}>"}
  end
end
