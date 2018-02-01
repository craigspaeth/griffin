defmodule Griffin.View.React do
  @moduledoc """
  Wrapper module that provides a nice API to the React FFI
  """

  @doc """
  Creates a React element with a text node as the inner child
  """
  def text_node(tag_label, attrs, text) do
    JS.window["React"].createElement(fn (props) ->
      JS.window["React"].createElement(Atom.to_string(tag_label), attrs, text)
    end, %{})
  end

  @doc """
  Uses ReactDOM to render React elements to a given selector in the document
  """
  def render(el, selector) do
    JS.window["ReactDOM"].render el, JS.window.document.querySelector(selector)
  end
end
