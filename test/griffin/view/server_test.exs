defmodule Griffin.View.ServerTest do
  @moduledoc false

  use ExUnit.Case

  defmodule View do
    @moduledoc false

    def styles, do: %{
      list: %{
        width: "100%",
        max_height: "100%"
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

  defmodule ComposedView do
    @moduledoc false

    def els do
      %{
        inner: NestedView
      }
    end

    def render(model) do
      [:div, [:inner]]
    end
  end

  defmodule WizardsView do
    @moduledoc false

    def render(model) do
      [:ul, for wizard <- model.wizards do
        [:li,
          [:h1, "Name: #{wizard.name}"],
          [:p, "Patronus: #{wizard.meta.patronus}"]]
      end]
    end
  end

  test "renders a Griffin view with a view model into html" do
    html = Griffin.View.Server.render View, %{name: "Harry"}
    assert html |> String.slice(0..3) == "<ul "
  end

  test "renders a Griffin view with inlined styles" do
    html = Griffin.View.Server.render View, %{name: "Harry"}
    assert html ==
      "<ul style=\"color: fushia; max-height: 100%; width: 100%\">" <>
      "<li>Hello Harry</li>" <>
      "</ul>"
  end

  test "renders nested children" do
    html = Griffin.View.Server.render NestedView, %{name: "Harry"}
    assert html == "<ul><li><a>Hello Harry</a><p>Welcome!</p></li></ul>"
  end

  test "composes child views" do
    html = Griffin.View.Server.render ComposedView, %{name: "Harry"}
    assert html ==
      "<div><ul><li>" <>
      "<a>Hello Harry</a><p>Welcome!</p>" <>
      "</li></ul></div>"
  end

  test "works with for comprehensions" do
    html = Griffin.View.Server.render WizardsView, %{wizards: [
      %{name: "Harry Potter", meta: %{patronus: "Deer"}},
      %{name: "Snape", meta: %{patronus: "Doe"}}
    ]}
    assert html ==
      "<ul>" <>
      "<li><h1>Name: Harry Potter</h1><p>Patronus: Deer</p></li>" <>
      "<li><h1>Name: Snape</h1><p>Patronus: Doe</p></li>" <>
      "</ul>"
  end
end