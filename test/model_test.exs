defmodule GriffinModelTest do
  @moduledoc """
  Tests for Model library
  """
  
  use ExUnit.Case
  import Griffin.Model

  test "validates a DSL schema" do
    schema = [
      name: [:string, :required]
    ]
    harry = %{name: "Harry Potter"}
    voldemort = %{name: nil}
    assert valid? harry, schema
    assert not valid? voldemort, schema
  end

  test "validates key val pairs" do
    schema = [
      name: [:string, min: 10]
    ]
    bob = %{name: "Bob"}
    assert not valid? bob, schema
  end

  test "validates multiple key val pairs" do
    schema = [
      name: [:string, min: 4, max: 6]
    ]
    assert not valid? %{name: "Bob"}, schema
    assert not valid? %{name: "Miranda"}, schema
    assert valid? %{name: "Sarah"}, schema
  end
  
  test "validates custom validation functions" do
    start_with_letter = fn (type, val, letter) ->
      String.first(val) == letter
    end
    schema = [
      name: [:string, must: [start_with_letter, "A"]]
    ]
    assert not valid? %{name: "Bob"}, schema
    assert valid? %{name: "Anne"}, schema
  end

  test "validates nested maps" do
    schema = [
      location: [:map, of: [
        city: [:string, :required, min: 3]
      ]]
    ]
    cincinnati = %{
      location: %{
        city: "Cincinnati"
      }
    }
    new_york = %{
      location: %{
        city: "NY"
      }
    }
    assert valid? cincinnati, schema
    assert not valid? new_york, schema
  end

  test "validates lists" do
    schema = [
      children: [:list, of: [:string, :required, min: 4]]
    ]
    parent = %{children: ["Bobby"]}
    expecting_parent = %{children: ["N/A"]}
    assert valid? parent, schema
    assert not valid? expecting_parent, schema
  end

  test "validates either types" do
    schema = [
      id: [:either, of: [
        [:string, min: 10],
        [:int, max: 100]
      ]]
    ]
    assert valid? %{id: "abcdefghijkl"}, schema
    assert valid? %{id: 99}, schema
    assert not valid? %{id: 101}, schema
  end

  test "validates list either types" do
    schema = [
      children: [:list, max: 3, of: [:either, of: [
        [:string, equals: "Bobby"],
        [:string, equals: "Sally"]
      ]]]
    ]
    assert valid? %{children: ["Bobby", "Sally"]}, schema
    assert not valid? %{children: ["Bobby", "Sally", "Timmy"]}, schema
    assert valid? %{children: ["Bobby", "Sally", "Bobby"]}, schema
    assert not valid? %{children: ["Bobby", "Sally", "Bobby", "Sally"]}, schema
  end
end
