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

  def starts_with_letter (letter) do
    fn (val) ->
      String.first(val) == letter
    end
  end
  
  test "validates custom validation functions" do
    schema = [
      name: [:string, starts_with_letter "A"]
    ]
    assert not valid? %{name: "Bob"}, schema
    assert valid? %{name: "Anne"}, schema
  end

  test "validates nested objects" do
    schema = [
      location: [:object, :required, keys: [
        city: [:string, :required, min: 3],
        
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

  test "validates nested lists" do
    schema = [
      children: [:list, items: [
        name: [:string, :required, min: 3],
      ]]
    ]
    parent = %{children: ["Bobby"]}
    expecting_parent = %{children: ["N/A"]}
    assert valid? parent, schema
    assert not valid? expecting_parent, schema
  end

  test "validates a complex schema" do
    # [
    #   name: [:string, length: 0..10],
    #   age: [:int, between: 0..100],
    #   single: [:boolean, :required],
    #   children: [:list, max_items: 10, items: [
    #     [:string, length: 0..100],
    #     [:number, max: 100, &custom_fn/1]
    #   ]],
    #   location: [:object, :required, keys: [
    #     city: [:string, :required],
    #     geo: [:object, keys: [
    #       lat: [:float, :required],
    #       lng: [:float, :required]
    #     ]]
    #   ]]
    # ]
  end
end
