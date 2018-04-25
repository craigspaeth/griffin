defmodule Griffin.View.ClientTest do
  use ExUnit.Case, async: false
  import Mock

  defmodule View do
    def render(model) do
      [:h1, "Hello #{model.name}"]
    end
  end

  defmodule View2 do
    def render(_) do
      [:input]
    end
  end

  defmodule View3 do
    def render(_) do
      [:form, [:input], [:button]]
    end
  end

  setup_with_mocks [
    {
      Griffin.View.React,
      [],
      [
        text_node: fn tag_label, attrs, text -> [tag_label, attrs, text] end,
        render: fn el, selector -> nil end
      ]
    }
  ] do
    {:ok, foo: :bar}
  end

  test "renders a Griffin view by building React elements" do
    Griffin.View.Client.render(View, %{name: "Harry"})
    assert called(Griffin.View.React.render(["h1", %{}, "Hello Harry"], "#main"))
  end

  test "renders a Griffin view without attrs or text" do
    Griffin.View.Client.render(View2, %{})
    assert called(Griffin.View.React.render(["input", %{}, nil], "#main"))
  end

  @tag :cur
  test "renders a view wrapped in a form" do
    Griffin.View.Client.render(View3, %{})

    assert called(
             Griffin.View.React.render(
               [
                 "form",
                 %{},
                 [
                   ["input", %{}, nil],
                   ["button", %{}, nil]
                 ]
               ],
               "#main"
             )
           )
  end
end
