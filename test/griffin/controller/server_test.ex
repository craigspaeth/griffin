defmodule Griffin.Controller.Server do
  @moduledoc false

  use ExUnit.Case

  defmodule View do
    def render(_) do
      [:ul@list,
        [:li@item, "Hello World"]]
    end
  end

  test "renders a Griffin view with a view model into html" do
    Griffin.Controller.Server.render
  end
end