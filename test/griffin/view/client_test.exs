defmodule Griffin.View.ClientTest do
  use ExUnit.Case, async: false
  import Mock

  defmodule View do
    def render(model) do
      [:h1, "Hello #{model.name}"]
    end
  end

  defmodule ViewWithStyles do
    def styles(_) do
      [
        strong: [
          font_weight: "bold"
        ]
      ]
    end

    def render(model) do
      [:h1@strong, "Hello #{model.name}"]
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

  test "renders inline styles using shorthands" do
    Griffin.View.Client.render(ViewWithStyles, %{name: "Harry"})
    result = ["h1", %{style: %{"font-weight" => "bold"}}, "Hello Harry"]
    assert called(Griffin.View.React.render(result, "#main"))
  end
end
