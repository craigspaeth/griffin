defmodule GriffinTest do
  use ExUnit.Case
  doctest Griffin

  test "the truth" do
    assert Griffin.hello() == :world
  end
end
