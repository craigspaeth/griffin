defmodule GriffinModelTest do
  use ExUnit.Case

  test "validates a map of fields with vex" do
    schema = %{name: [:string, [presence: :true], [presence: :false]]}
    foo = %{name: "present"}
    bar = %{name: ""}
    assert Griffin.Model.validate foo, schema
    assert not Griffin.Model.validate bar, schema
  end

  test "validates a nested map of fields with vex" do
    schema = %{
      name: [:string],
      location: %{
        city: [:string],
        country: [:string, [presence: :true]],
        state: [:string]
      }
    }
    cincinnati = %{
      name: "present",
      location: %{
        city: "Cincinnati",
        country: "USA",
        state: "Ohio"
      }
    }
    assert Griffin.Model.validate cincinnati, schema
  end
end
