defmodule Griffin.View.React do
  @moduledoc """
  Wrapper module that provides a nice API to the React FFI
  """

  @doc """
  Creates a React element with a text node as the inner child
  """
  def text_node(tag_label, attrs, text) do
    IO.puts(attrs)

    JS.root()["React"].createElement(
      fn props ->
        JS.root()["React"].createElement(tag_label, attrs, text)
      end,
      %{}
    )
  end

  @doc """
  Uses ReactDOM to render React elements to a given selector in the document
  """
  def render(el, selector) do
    JS.root()["ReactDOM"].render(el, JS.root().document.querySelector(selector))
  end
end
