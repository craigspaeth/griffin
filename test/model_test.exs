defmodule GriffinModelTest do
  use ExUnit.Case

  test "validates a map of fields with vex" do
    schema = %{name: [:string, [presence: :true], [presence: :false]]}
    foo = %{name: "present"}
    bar = %{name: ""}
    assert Griffin.Model.validate foo, schema
    assert not Griffin.Model.validate bar, schema
  end
end
