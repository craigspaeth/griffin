defmodule Griffin.View.React do
  @moduledoc """
  Wrapper module that provides a nice API to the React FFI
  """

  @update nil

  @doc """
  FFI to React.createElement
  """
  def create_element(tag_label, attrs, text) do
    JS.global()["React"].createElement(tag_label, attrs, text)
  end

  @doc """
  Uses ReactDOM to render React elements to a given selector in the document
  """
  def render(component, props, selector) do
    JS.embed("let self = this")
    update = JS.embed("self.update")

    if is_nil(update) do
      klass =
        JS.embed(
          "class Wrapper extends React.Component { constructor() { super(); this.state = props; self.update = (props) => this.setState(props) } render() { return React.createElement(component, this.state) } }"
        )

      wrapper = JS.global()["React"].createElement(klass, %{})
      JS.global()["ReactDOM"].render(wrapper, JS.global().document.querySelector(selector))
    else
      update.(props)
    end
  end
end
