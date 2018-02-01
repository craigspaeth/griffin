defmodule Griffin.View.ClientTest do
  @moduledoc false

  use ExUnit.Case, async: false
  import Mock

  defmodule View do
    @moduledoc false

    def render(model) do
      [:h1, "Hello #{model.name}"]
    end
  end

  defmodule ViewWithStyles do
    @moduledoc false

    def render(model) do
      [:h1, "Hello #{model.name}"]
    end
  end

  setup_with_mocks [
    {
      Griffin.View.React, [], [
        text_node: fn (tag_label, attrs, text) -> [tag_label, attrs, text] end,
        render: fn (el, selector) -> end
      ]
    }
  ] do
    {:ok, foo: :bar}
  end

  test "renders a Griffin view by building React elements" do
    Griffin.View.Client.render View, %{name: "Harry"}
    assert called Griffin.View.React.render [:h1, nil, "Hello Harry"], "#main"
  end

  test "renders inline styles using shorthands" do

  end
end
