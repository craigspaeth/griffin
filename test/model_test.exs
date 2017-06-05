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
