defmodule Griffin.View.ServerTest do
  @moduledoc false

  use ExUnit.Case

  defmodule View do
    @moduledoc false

    def styles, do: %{
      list: %{
        width: "100%"
      },
      colorful: %{
        color: "fushia"
      }
    }

    def render(model) do
      [:ul@list@colorful,
        [:li, "Hello #{model.name}"]]
    end
  end

  defmodule NestedView do
    @moduledoc false
    def render(model) do
      [:ul,
        [:li,
          [:a, "Hello #{model.name}"],
          [:p, "Welcome!"]]]
    end
  end

  test "renders a Griffin view with a view model into html" do
    html = Griffin.View.Server.render View, %{name: "Harry"}
    assert html |> String.slice(0..3) == "<ul "
  end

  test "renders a Griffin view with inlined styles" do
    html = Griffin.View.Server.render View, %{name: "Harry"}
    assert html == "<ul style=\"color: fushia; width: 100%\">" <>
      "<li>Hello Harry</li></ul>"
  end

  test "renders nested children" do
    html = Griffin.View.Server.render NestedView, %{name: "Harry"}
    assert html == "<ul><li><a>Hello Harry</a><p>Welcome!</p></li></ul>"
  end
end