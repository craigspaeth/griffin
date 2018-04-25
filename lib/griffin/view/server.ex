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
        {tag_label, _, children} = Griffin.View.Shared.split_dsl_el(el)

        children =
          children
          |> Enum.map(fn child -> to_html(view, model, child) end)
          |> Enum.join("")

        "<#{tag_label}>#{children}</#{tag_label}>"
    end
  end
end
