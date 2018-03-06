defmodule Griffin.View.ServerTest do
  use ExUnit.Case

  defmodule View do
    def render(model) do
      [:ul, [:li, "Hello #{model.name}"]]
    end
  end

  defmodule NestedView do
    def render(model) do
      [:ul, [:li, [:a, "Hello #{model.name}"], [:p, "Welcome!"]]]
    end
  end

  defmodule WizardsView do
    def render(model) do
      [
        :ul,
        for wizard <- model.wizards do
          [:li, [:h1, "Name: #{wizard.name}"], [:p, "Patronus: #{wizard.meta.patronus}"]]
        end
      ]
    end
  end

  defmodule AttrsView do
    def render(_) do
      [:h1, [on_click: fn -> end]]
    end
  end

  test "renders a Griffin view with a view model into html" do
    html = Griffin.View.Server.render(View, %{name: "Harry"})
    assert html |> String.slice(0..3) == "<ul>"
  end

  test "renders nested children" do
    html = Griffin.View.Server.render(NestedView, %{name: "Harry"})
    assert html == "<ul><li><a>Hello Harry</a><p>Welcome!</p></li></ul>"
  end

  test "works with for comprehensions" do
    html =
      Griffin.View.Server.render(WizardsView, %{
        wizards: [
          %{name: "Harry Potter", meta: %{patronus: "Deer"}},
          %{name: "Snape", meta: %{patronus: "Doe"}}
        ]
      })

    assert html ==
             "<ul>" <>
               "<li><h1>Name: Harry Potter</h1><p>Patronus: Deer</p></li>" <>
               "<li><h1>Name: Snape</h1><p>Patronus: Doe</p></li>" <> "</ul>"
  end

  @tag :cur
  test "works with attrs" do
    html = Griffin.View.Server.render(AttrsView, %{})
    assert html == "<h1></h1>"
  end
end
